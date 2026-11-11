---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: vi
kind: article
title: Kiểm tra độ tin cậy của trạm trung chuyển API
description: "Quy trình nghiệm thu trạm trung chuyển có thể lặp lại: cố định yêu cầu trước, rồi quan sát thời gian tới byte đầu tiên, việc kết thúc luồng, phân loại lỗi và giới hạn thử lại."
category: Độ tin cậy
tags: [api, streaming, vận hành]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110, ngữ nghĩa HTTP
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, sự kiện do máy chủ gửi (Server-sent events)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Đây là một mẫu quy trình vận hành có thể dùng lại, không phải kết quả đo của Folkbench cho bất kỳ trạm trung chuyển nào. Chỉ những bản snapshot đã công bố, có kèm lần chạy (run), thời gian, mẫu và giới hạn công khai, mới là dữ kiện đánh giá của Folkbench.

## Mục tiêu

Trước khi tích hợp một trạm trung chuyển API mới, hãy xác nhận đường đi của yêu cầu tối thiểu hoạt động được, và chia lỗi thành bốn loại: phía máy khách, giao thức, phía thượng nguồn (upstream) và phía dịch vụ. Một kỹ sư khác phải có thể kiểm tra lại kết quả nghiệm thu bằng đúng yêu cầu đó.

## Trước khi bắt đầu

Chuẩn bị một mẫu yêu cầu cố định không chứa dữ liệu người dùng thật. Ghi lại ID mô hình, thân yêu cầu, chế độ streaming, thời gian chờ, số lần thử lại và thời điểm kiểm tra. Thông tin xác thực dùng để kiểm tra chỉ được để trong trình quản lý bí mật (secret manager) cục bộ hoặc biến môi trường tạm thời; không ghi vào log, ảnh chụp màn hình, kho mã hay trang công khai.

## Bước 1: Cố định yêu cầu và ranh giới quan sát

Bắt đầu bằng yêu cầu tối thiểu và đối chiếu mã trạng thái HTTP, header phản hồi và thân phản hồi với tài liệu của nhà cung cấp. Ghi ID yêu cầu, ID mô hình, mã trạng thái và tổng thời gian vào bảng kiểm thử; đừng dán nguyên header Authorization hay phản hồi thô vào phiếu hỗ trợ.

Nếu endpoint hỗ trợ trả về dạng luồng, hãy chạy riêng một yêu cầu streaming. Ghi lại thời điểm nhận được khối dữ liệu hữu ích đầu tiên, các khối có tiếp tục đến đều hay không, sự kiện kết thúc có xuất hiện hay không, và khi kết nối đóng thì máy khách có nhận được kết quả rõ ràng hay không. SSE là một luồng sự kiện: trình phân tích phải xử lý theo ranh giới sự kiện, chứ không đoán token dựa trên cách mạng chia gói.

## Bước 2: Phân loại lỗi

Dùng đầu vào cố định để lần lượt kích hoạt các kiểm tra sau:

1. **Lỗi phía máy khách:** mô hình không hợp lệ, thiếu tham số hoặc vượt giới hạn yêu cầu phải trả về kết quả 4xx đủ để xác định nguyên nhân.
2. **Lỗi xác thực:** thông tin xác thực đã hết hạn hoặc không đủ quyền phải bị từ chối rõ ràng, và phản hồi không được làm lộ thông tin xác thực khác hay địa chỉ nội bộ.
3. **Lỗi thượng nguồn:** khi thượng nguồn hết thời gian chờ, bị giới hạn tốc độ hoặc tạm thời không khả dụng, phải phân biệt được lỗi có thể thử lại và lỗi không thể thử lại.
4. **Lỗi streaming:** kết nối bị ngắt, thiếu sự kiện kết thúc hoặc sự kiện JSON bị cắt nửa chừng đều phải đi vào nhánh xử lý lỗi, không được coi là văn bản đã hoàn tất.

Với mỗi loại lỗi, giữ lại ít nhất mã trạng thái, loại lỗi, thời điểm phía máy khách quan sát được và một bản tóm tắt ngắn đã che dữ liệu nhạy cảm. Phản hồi thô, trace và ảnh chụp màn hình là bằng chứng quá trình; hãy lưu chúng theo quy trình lưu trữ đối tượng riêng tư của dự án, và không đưa vào bài viết công khai hay bảng xếp hạng.

## Bước 3: Xác định giới hạn thử lại

Chỉ tự động thử lại những yêu cầu có ngữ nghĩa lũy đẳng (idempotent) rõ ràng hoặc có thể lặp lại an toàn. Đặt tổng ngân sách cho việc thử lại và ghi lại ID liên kết giữa yêu cầu đầu tiên và yêu cầu cuối cùng. Gặp lỗi xác thực, tham số sai hoặc bị từ chối do kiểm duyệt nội dung thì đừng thử lại một cách mù quáng.

Một bảng nghiệm thu dễ đọc có thể gồm:

| Hạng mục | Điều kiện đạt | Xử lý khi không đạt |
| --- | --- | --- |
| Mã trạng thái | Khớp với quy ước trong tài liệu | Lưu tóm tắt đã che dữ liệu nhạy cảm và phân loại |
| Byte đầu tiên | Nhận được dữ liệu hữu ích trong thời gian chờ đã thống nhất | Kiểm tra mạng, định tuyến và thượng nguồn |
| Kết thúc luồng | Nhận được sự kiện kết thúc hợp lệ hoặc phản hồi đầy đủ | Đánh dấu lỗi kết nối |
| Phân loại lỗi | Phân biệt được 4xx, 5xx và hết thời gian chờ | Không bao giờ coi lỗi là đầu ra của mô hình |
| Thử lại | Truy vết được số lần và tổng thời gian | Dừng khi vượt ngân sách |

## Tiêu chí đạt và dọn dẹp

Viết tiêu chí đạt trước khi kiểm tra, ví dụ: “yêu cầu cố định trả về kết quả đầy đủ trong cả ba lần thử độc lập, yêu cầu streaming có sự kiện kết thúc rõ ràng, và lỗi xác thực không bao giờ bị thử lại”. Đừng điều chỉnh tiêu chí sau khi đã thấy kết quả.

Sau khi kiểm tra, hãy thu hồi thông tin xác thực tạm thời, xóa các phản hồi thô lưu cục bộ, và giữ lại một bản ghi nghiệm thu chỉ gồm tóm tắt, thời gian và phiên bản. Muốn công bố kết quả lên Folkbench, trước hết phải liên kết với run/attempt thật, manifest bằng chứng và snapshot công bố; bản thân bài viết này không thay thế những dữ kiện đó.

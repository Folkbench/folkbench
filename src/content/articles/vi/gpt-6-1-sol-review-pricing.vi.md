---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: vi
kind: article
title: Thông số, giá ngữ cảnh dài và các so sánh đã công bố của GPT-6.1 Sol
description: "Thông số chính thức, giá niêm yết dưới và trên 272K token đầu vào, cùng các mức chênh lệch và chi phí mỗi tác vụ được công bố cho GPT-6.1 Sol. Các số liệu này lấy từ trang công khai của OpenAI, không phải kết quả đo của Folkbench."
category: Mô hình
tags: [giá, đánh giá chuẩn, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, trang công bố GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, trang mô hình GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: Bảng giá OpenAI API
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, phụ lục system card của GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Thông số và giá dưới đây lấy từ trang mô hình và bảng giá của OpenAI. Các so sánh lấy từ trang công bố. Chúng tôi đã đối chiếu vào ngày 2 tháng 10 năm 2026. Trang công bố đưa ra mức chênh lệch và chi phí, chứ không phải một bảng điểm tuyệt đối có thể chép lại. Folkbench không chạy lại các bài đánh giá này. Câu “khoảng một phần năm chi phí” mô tả hệ thống thử nghiệm của chính hãng.

OpenAI mô tả GPT-6.1 Sol là bản nâng cấp của `gpt-6-sol`. ID mô hình trên API là `gpt-6.1-sol`. Theo trang công bố, mô hình này tiến gần `gpt-6-astra` ở lập trình phức tạp, điều khiển máy tính và công việc chuyên môn, trong khi giá đầu vào và đầu ra tiêu chuẩn chỉ bằng một phần năm của Astra. Đọc cache có giá 0,10 USD cho mỗi 1 triệu token, bằng 5% giá đầu vào tiêu chuẩn và bằng một nửa giá đọc cache của `gpt-6-sol`. Với nghiên cứu khoa học khó nhất, trang công bố vẫn khuyên dùng Astra. `gpt-6-sol` vẫn còn trên bảng giá.

Trang công bố GPT-6 Sol và Luna trỏ tới mô hình này trong bản cập nhật ngày 29 tháng 9 năm 2026. Bài viết này không coi ngày ghi trên một thẻ tin tức khác ở chân trang là ngày công bố của chính GPT-6.1 Sol.

Giá niêm yết và bảng điểm chuẩn phía Claude có trong bài [Opus 5.5](../claude-opus-5-5-review-pricing/) và [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Thông số đã công bố

| Mục | GPT-6.1 Sol |
| --- | --- |
| ID mô hình | `gpt-6.1-sol` |
| Cửa sổ ngữ cảnh | 1.050.000 token |
| Đầu vào tối đa | 922.000 token |
| Đầu ra tối đa | 128.000 token |
| Đầu vào sang đầu ra | Văn bản và hình ảnh sang văn bản |
| Mốc kiến thức | Ngày 30 tháng 4 năm 2026 |
| `reasoning.effort` | `low`, `medium` (mặc định), `high`, `xhigh`, `max` |
| Mức effort không được chấp nhận | `none`, `minimal` |
| Gọi công cụ | Responses API |
| Chat Completions | Có, không kèm công cụ |
| Endpoint được liệt kê là hỗ trợ | Chat Completions, Responses, Batch |
| Trang mô hình ghi là không hỗ trợ | Realtime, Assistants, tinh chỉnh (fine-tuning), embeddings, tạo hình ảnh, video, giọng nói |
| Lưu trú dữ liệu | Mỹ và EU. Chế độ Fast không dùng được cùng lưu trú dữ liệu tại EU |

Đầu vào tối đa 922.000 khớp với cửa sổ ngữ cảnh 1.050.000 trừ đi đầu ra tối đa 128.000: 1.050.000 − 128.000 = 922.000. Trang mô hình ghi là có hỗ trợ token suy luận, nhưng các đoạn được trích ở đây không nêu riêng công thức tính phí cho loại token này. Khi lập ngân sách, hãy dựa vào đầu vào, cache và đầu ra trong bản ghi usage.

## Giá niêm yết

### Ngữ cảnh ngắn và ngữ cảnh dài

Giá tính bằng USD cho mỗi 1 triệu token. Cả hai mức đều lấy từ bảng giá API được đối chiếu ngày 2 tháng 10 năm 2026. Bảng giá ghi rõ: ngữ cảnh ngắn là đầu vào không quá 272K token, ngữ cảnh dài là đầu vào trên 272K token. Trang mô hình ghi rằng khi vượt 272K, đầu vào và cache tính gấp 2 lần, đầu ra gấp 1,5 lần, áp dụng cho toàn bộ yêu cầu.

| Mỗi 1 triệu token | 6.1 ngắn | 6.1 dài | Sol ngắn | Sol dài | Astra ngắn | Astra dài |
| --- | --- | --- | --- | --- | --- | --- |
| Đầu vào | 2 USD | 4 USD | 2 USD | 4 USD | 10 USD | 20 USD |
| Đọc cache | 0,10 USD | 0,20 USD | 0,20 USD | 0,40 USD | 1 USD | 2 USD |
| Ghi cache | 2,50 USD | 5 USD | 2,50 USD | 5 USD | 12,50 USD | 25 USD |
| Đầu ra | 10 USD | 15 USD | 10 USD | 15 USD | 50 USD | 75 USD |

Đầu vào không quá 272K dùng mức ngắn. Một khi yêu cầu vượt 272K, cả những token phía trước cũng bị tính lại theo đơn giá mức dài, chứ không chỉ phần token vượt ra mới đổi giá. Đọc cache của 6.1 bằng một nửa Sol. Đầu vào và đầu ra tiêu chuẩn bằng một phần năm Astra. Đọc cache thì không bằng một phần năm Astra: đọc cache ngữ cảnh ngắn của Astra là 1 USD, còn của 6.1 là 0,10 USD.

Ghi cache bằng 1,25 lần đầu vào không cache, nên mức ngắn là 2 USD × 1,25 = 2,50 USD và mức dài là 4 USD × 1,25 = 5 USD. Đầu ra mức dài bằng 1,5 lần mức ngắn: 10 USD × 1,5 = 15 USD.

### Các hệ số khác trên bảng giá

Trang mô hình liệt kê thêm ba hệ số chính thức. Chế độ Fast gấp 2 lần giá tiêu chuẩn. Batch và Flex rẻ hơn giá tiêu chuẩn 50%. Xử lý theo khu vực, ở nơi có hỗ trợ, cộng thêm 10%. Trên bảng giá cùng ngày, Batch, Flex và Fast mỗi loại có một dòng riêng, và các con số khớp với những hệ số này. Ví dụ, chế độ Fast của 6.1 ở ngữ cảnh ngắn là 4 USD đầu vào, 0,20 USD đọc cache, 5 USD ghi cache và 20 USD đầu ra.

Trang công bố còn cho biết Ultrafast sẽ có mặt trong Codex trong vài ngày tiếp theo, với tốc độ sinh token nhanh hơn tốc độ tiêu chuẩn tới 8 lần. Bảng giá các mô hình chủ lực đọc ngày 2 tháng 10 năm 2026 không có dòng riêng cho Ultrafast. Một hóa đơn cụ thể đã áp hệ số chính thức nào hay chưa, hãy xem bản ghi usage.

Ba ví dụ có thể tự tính lại ở mức tiêu chuẩn. Hai dòng đầu nằm trong mức ngắn. Dòng thứ ba có 280.000 token đầu vào, nên toàn bộ yêu cầu dùng mức dài. Dòng có cache giả định bản ghi usage tính số token đầu vào đó là trúng cache.

| Yêu cầu | Phép tính | Số tiền |
| --- | --- | --- |
| 100 nghìn token đầu vào không cache, 5.000 token đầu ra | 0,1 × 2 USD + 0,005 × 10 USD | 0,25 USD |
| 100 nghìn token đọc cache, 5.000 token đầu ra | 0,1 × 0,10 USD + 0,005 × 10 USD | 0,06 USD |
| 280 nghìn token đầu vào không cache, 10.000 token đầu ra | 0,28 × 4 USD + 0,01 × 15 USD | 1,27 USD |

Nếu tính nhầm 280.000 token đó theo đơn giá mức ngắn, bạn sẽ được 0,28 × 2 USD + 0,01 × 10 USD = 0,66 USD. Đó không phải giá của mức này. Ba dòng trên chưa áp Fast, Batch, Flex hay phụ phí khu vực.

## Đọc các so sánh trên trang công bố thế nào

Trang công bố đưa ra mức chênh lệch và chi phí, chứ không phải bảng điểm tuyệt đối. Bảng dưới đây chỉ giữ những so sánh mà trang đó ghi rõ. Các câu về chi phí mô tả hệ thống thử nghiệm của OpenAI.

| Bài đánh giá | Trang công bố ghi | Điều kiện |
| --- | --- | --- |
| DeepSWE v1.1 | Ngang Astra; cao hơn điểm tốt nhất của Sol 6,4 điểm phần trăm | Mức suy luận thấp hơn, chi phí khoảng một phần năm |
| GDP.pdf | Cao hơn Opus 5.5 có fallback; gần Astra | Các mức suy luận đã thử; chưa tới một nửa chi phí của Opus, khoảng một phần năm chi phí của Astra |
| AutomationBench | Cao hơn Opus 5.5 2,2 điểm phần trăm; cao hơn Sol cùng mức thiết lập 4,8 điểm phần trăm | medium; khoảng một phần ba chi phí của Opus |
| Bộ ngoại tuyến OSWorld 2.0 | Cao hơn Sol 7 điểm phần trăm; kém Astra không quá 2,1 điểm phần trăm | max; partial reward, v2026.08.08; chưa tới một nửa chi phí của Sol, khoảng một phần bảy chi phí của Astra |
| Terminal-Bench Science 0.1 | Điểm cao hơn gấp đôi Sol; Astra vẫn có điểm cao nhất trong các mô hình được thử, 68,1% | max; 6.1 trung bình 5,47 USD mỗi tác vụ, Opus 5.5 là 23,21 USD, Astra là 23,80 USD |
| Tính chính xác thông tin | Tỷ lệ câu trả lời có ít nhất một lỗi thực tế giảm từ 11,4% xuống 7,7% | low; kém Astra không quá 1,9 điểm phần trăm |

Mẫu đánh giá tính chính xác thông tin là các cuộc hội thoại đã ẩn danh, trong đó người dùng từng đánh dấu một lỗi trước đó. Trang công bố nói các prompt này được chọn có chủ đích là khó và không đại diện cho lưu lượng thông thường. Số tiền ở Terminal-Bench Science là chi phí trung bình mỗi tác vụ do OpenAI công bố, không phải giá theo nhóm của một trạm trung chuyển nào. Điểm khoa học cao nhất trong các mô hình được thử vẫn là Astra với 68,1%, và trang công bố khuyên giữ nghiên cứu khoa học khó nhất trên Astra.

Cùng trang đó cũng đưa ra tỷ lệ thất bại trong các bài kiểm tra căn chỉnh (alignment) được thiết kế có chủ đích là khó. Khi công cụ tìm kiếm đã hỏng sẵn, tỷ lệ lượt chạy ở mức max không báo cho người dùng biết là 2,1% với 6.1, 4,9% với Sol, 1,5% với Astra và 28,7% với Luna. Trang công bố cho biết không ghi nhận nỗ lực nào nhằm vượt qua bộ duyệt an toàn tự động, giống như Astra và Sol. Chi tiết nằm trong phụ lục system card của GPT-6.1 Sol. Những tỷ lệ này không phải tỷ lệ lỗi trên lưu lượng thông thường.

Trang công bố cũng ghi rằng các bài đánh giá chạy trong môi trường nghiên cứu hoặc qua API, có thể khác ChatGPT bản chính thức về system prompt và công cụ. Số liệu của đối thủ lấy từ các báo cáo công khai.

## Hai đường gửi yêu cầu cần tách riêng

Gọi công cụ dùng Responses. Mức effort mặc định đã là `medium`. Trang mô hình ghi rằng Chat Completions có thể gửi văn bản không kèm công cụ.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, không kèm tools
model: gpt-6.1-sol
reasoning_effort: medium

# Trang mô hình ghi là không chấp nhận
reasoning.effort: none
reasoning.effort: minimal
tools trong một yêu cầu Chat Completions
```

Khi chuyển từ `gpt-6-sol` hoặc `gpt-6-luna` (vốn chấp nhận `none`), hãy so sánh lại ở mức `low`. Đừng để `none` trong yêu cầu. Công cụ, điều khiển máy tính, tìm kiếm tệp và tìm kiếm web đi qua Responses. Chat Completions chỉ đảm nhận các yêu cầu không có công cụ. Các công cụ Responses được liệt kê trên trang mô hình gồm tìm kiếm web, tìm kiếm tệp, trình thông dịch mã, điều khiển máy tính và MCP. Đầu vào hình ảnh dùng mảng content trong tin nhắn của người dùng.

Ở mức ngắn, giá đầu vào và đầu ra giống `gpt-6-sol`. Đọc cache giảm từ 0,20 USD xuống 0,10 USD. Đầu ra mức dài của cả hai đều là 15 USD, còn đọc cache mức dài giảm từ 0,40 USD xuống 0,20 USD. Khi chuyển sang 6.1, hãy cố định tên mô hình trên kết quả trả về. Kết quả rơi vào một ID khác thì không tính là lần chuyển đổi này.

## Những điều cần kiểm tra trước khi chuyển lưu lượng

1. Cố định `gpt-6.1-sol`. Tên mô hình trên kết quả trả về cũng phải là ID đó.
2. Chạy lại cùng một bộ dữ liệu không chứa thông tin nhạy cảm ở các mức `low`, `medium`, `high`, `xhigh` và `max`. `none` và `minimal` không có trên thẻ mô hình này.
3. Đặt công cụ trên Responses. Không gắn công cụ vào yêu cầu Chat Completions.
4. Tính giá cho một prompt có đầu vào không quá 272K token và một prompt trên 272K. Prompt thứ hai dùng đơn giá mức dài cho toàn bộ yêu cầu.
5. Lập ngân sách trước hết từ hai dòng giá tiêu chuẩn. Fast, Batch, Flex và phụ phí khu vực lấy theo số tiền thực tế xuất hiện trong bản ghi usage.
6. Xem số token cache trong bản ghi usage trước khi dùng ví dụ cache ở trên.
7. Lưu trú dữ liệu tại EU không kết hợp được với chế độ Fast. Trang mô hình ghi là hỗ trợ lưu trú tại Mỹ và EU, nhưng không mô tả lưu trú dữ liệu như một tham số có thể thêm tùy ý trên bất kỳ gateway nào.
8. Giữ nghiên cứu khoa học khó nhất trên `gpt-6-astra`. `gpt-6-sol` vẫn còn trên bảng giá.

Sau khi chọn được mô hình, việc một trạm trung chuyển có cung cấp ID này hay không, cùng tỷ lệ khả dụng và giá đã công bố của trạm đó, hãy xem bản ghi trong danh mục. Các bảng trong bài này là giá niêm yết của OpenAI, không phải giá của một trạm sau khi đã nhân hệ số nhóm.

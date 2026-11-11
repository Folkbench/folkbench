---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: vi
kind: article
title: "Đừng để con số khả dụng 99% đánh lừa: những sự cố trạm trung chuyển AI API chúng tôi đã gặp và cách chúng tôi kiểm tra độ ổn định"
description: "Bắt đầu từ phản hồi 200 giả, luồng bị cắt giữa chừng và tình trạng khựng về đêm, bài viết giải thích cách định nghĩa các chỉ số và bài kiểm tra độ ổn định thực sự quyết định trải nghiệm trên môi trường production."
category: Độ tin cậy
tags: [độ ổn định, tỷ lệ khả dụng, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Sách Google SRE, Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: Tài liệu OpenTelemetry
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: Chuẩn HTML, Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Khoảng tin cậy Wilson
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Mở đầu.** Trên con đường đưa ứng dụng AI lên production, trạm trung chuyển API là chặng mà phần lớn lập trình viên khó tránh. Trang web của trạm có thể hứa “nhanh và ổn định 99,9%” hay “kênh riêng chịu tải cao”. Nhưng khi thực sự kết nối, bạn sẽ thấy nước sâu hơn khẩu hiệu nhiều. Đây là ghi chép về việc đội ngũ chúng tôi đi từ mua theo cảm tính đến chạy kiểm tra tự động, cùng khung kiểm tra mà chúng tôi dùng trước khi trả tiền hay tích hợp.

## 1. Những sự cố buộc chúng tôi phải có phương pháp

Hệ thống nhiều chỉ số dưới đây không bắt đầu từ sự khôn ngoan nào cả. Nó được trả giá bằng tiền thật, sự cố production và lời phàn nàn của người dùng.

### 1. “200 OK” giả và kiểu cắt ngang lặng lẽ

Những bài kiểm tra tự động đầu tiên rất đơn giản. Một script Python gửi POST tới trạm mỗi 5 phút. Cứ nhận HTTP `200` kèm chút văn bản là coi như ổn.

Agent trên production chạy chưa được hai ngày thì bộ phận hỗ trợ khách hàng đã quá tải. Người dùng phản ánh mô hình dừng giữa câu, còn logic nội dung sinh ra thì đứt gãy.

Log còn tệ hơn các phiếu hỗ trợ. Một số trạm vẫn trả `200 OK` khi kho tài khoản phía thượng nguồn đã cạn (giới hạn tốc độ 429 hoặc lỗi xác thực 401), khi gateway hết thời gian chờ (504), hoặc khi một node bị sập. Giữa một luồng SSE, chúng lặng lẽ chèn `data: [DONE]` để kết thúc lượt trả lời, hoặc nhét `{"error": "rate limit exceeded"}` vào JSON rồi trình bày như thể đó là câu trả lời của mô hình. Một bộ giám sát chỉ nhìn mã trạng thái đã bị phản hồi 200 giả đó đánh lừa hoàn toàn.

### 2. Khựng về đêm, và token đầu tiên mãi không tới

Sau đó, chúng tôi thêm các lượt đo liên tục suốt ngày đêm. Ban ngày, thời gian phản hồi trung bình giữ quanh 2 giây và bảng theo dõi trông rất ổn. Nhưng vào giờ cao điểm ban đêm, tỷ lệ hết thời gian chờ và tỷ lệ người dùng bỏ đi tăng vọt.

Phần lớn các trạm đó không phải kênh kết nối trực tiếp chính thức. Chúng trộn kho tài khoản khu vực Mỹ với proxy ở nhiều vùng. Khi tới giờ làm việc ở Bắc Mỹ hoặc giờ cao điểm ban đêm trong nước, lượng truy cập đồng thời làm sập cả tuyến đường. Trường hợp tệ nhất vẫn hoàn tất toàn bộ câu trả lời trong khoảng 4 giây, nhưng token đầu tiên (TTFT) mất trọn 12 giây. Người dùng nhìn chằm chằm vào ô trống rồi bỏ đi.

Hai sự cố đó đặt lại nguyên tắc: một lần ping, hay vài yêu cầu gửi qua loa, không phải là kiểm tra một giao thức AI hay một luồng dữ liệu.

## 2. Ba phiên bản của hệ thống kiểm tra

### 1.0 Thử mò và cảm tính

- **Cách làm:** gửi vài prompt trên giao diện web, hoặc tự viết script gửi 10 yêu cầu, rồi đánh giá tốc độ và chất lượng câu trả lời bằng mắt.
- **Giới hạn:** mẫu quá nhỏ và nhiễu. Tải đồng thời cao hay một lần mất kết nối hiếm gặp chỉ lộ ra trên production.

### 2.0 Tải đồng thời và mã trạng thái HTTP

- **Cách làm:** chạy Postman và Locust với tải đồng thời, theo dõi phân bố mã trạng thái, độ trễ trung bình và tỷ lệ thành công.
- **Giới hạn:** cách này chỉ thấy lớp gateway bên ngoài. Nó bỏ sót luồng bị đứt, lỗi giả mạo và tình trạng khựng giữa các token.

### 3.0 Máy trạng thái cho luồng, học hỏi từ các lĩnh vực khác

Khi bộ chỉ số tự xây của chúng tôi chững lại, chúng tôi đã nói chuyện với anh Zhou, người làm giao dịch tần suất cao và vận hành CDN.

Anh nói thẳng: trạm trung chuyển AI API không phải một endpoint web thông thường. Đó là một thiết bị trung gian mạng với kết nối dài và tải đồng thời cao.

Anh so sánh luồng SSE của AI, về cả cấu trúc mạng lẫn độ nhạy với mất gói, với truyền âm thanh và video thời gian thực (WebRTC/RTMP) và với nguồn cấp dữ liệu thị trường chứng khoán. Mô hình chấm điểm từng yêu cầu web là sai hướng. Những phép so sánh hữu ích là độ trễ tick-to-trade trong giao dịch tần suất cao và thời gian tới khung hình đầu tiên trên CDN.

Cuộc trò chuyện đó đã thay thế bộ giám sát cũ. Chúng tôi dựng đầu dò ở nhiều khu vực, tách riêng việc thiết lập kết nối, bắt tay TLS, thời điểm token đầu tiên tới, thông lượng token và việc phân tích gói SSE, rồi làm mượt chuỗi số liệu. Đó là tiêu chuẩn tự động mà chúng tôi đang dùng.

## 3. Ba khía cạnh quyết định trải nghiệm trên production

```text
                       ┌── TTFT (độ trễ token đầu tiên) -> người dùng phải chờ bao lâu
            ┌── Độ trễ ┼── TPS (tốc độ sinh) -> độ mượt của hiệu ứng gõ chữ
            │          └── Độ trễ P95/P99 -> trường hợp xấu nhất và giờ cao điểm
            │
Chỉ số đo ──┼── Độ tin cậy ┬── Phân tích thành công -> loại phản hồi 200 giả và payload sai định dạng
            │              └── Retry-to-success -> khả năng chịu lỗi với backoff lũy thừa
            │
            └── Chất lượng luồng ┬── Gián đoạn luồng -> câu trả lời dừng giữa chừng
                                 └── Jitter token -> đầu ra bị khựng
```

### 1. Độ trễ: tách thời gian chờ khỏi thời gian sinh

- **TTFT (độ trễ token đầu tiên):** số mili giây từ lúc gửi yêu cầu HTTP tới khi nhận gói SSE đầu tiên. Đây chính là “khung hình đầu tiên”. Ngưỡng của chúng tôi trên production là TTFT < 1,5 giây.
- **TPS (token mỗi giây):** tốc độ sinh sau token đầu tiên, tính bằng số token sinh ra / thời lượng. TPS thấp khiến hiệu ứng gõ chữ bị giật cục.
- **Độ trễ P95 / P99:** bỏ qua con số trung bình dễ gây ảo tưởng. Phân vị thứ 95 và 99 mới cho thấy giờ cao điểm, ngữ cảnh dài và kênh bị nghẽn.

### 2. Độ tin cậy: nhìn xuyên qua thành công giả

- **Tỷ lệ phân tích thành công:** chỉ có `200` là chưa đủ. SDK chính thức phải phân tích được payload, JSON phải đầy đủ, và lỗi do trạm tự chèn vào không được lẫn vào câu trả lời.
- **Retry-to-success (thành công sau thử lại):** mô phỏng cơ chế backoff lũy thừa trên production, xem lỗi 429 hay 5xx có được khắc phục qua kênh dự phòng trong vòng 3 lần thử lại hay không.

### 3. Chất lượng luồng: bắt các lỗi im lặng

- **Gián đoạn luồng:** tỷ lệ lượt gọi có kết nối TCP bị ngắt, hoặc im bặt, trước khi tới dấu kết thúc `data: [DONE]` theo quy ước.
- **Jitter giữa các token:** độ lệch chuẩn của khoảng cách giữa hai gói SSE liền kề, mượn từ khái niệm jitter trong truyền âm thanh và video. Jitter cao cho thấy đường truyền phía sau không ổn định, hoặc đã bị chồng nhiều lớp bộ đệm proxy.

## 4. Những tài liệu tham khảo, không phải tự nghĩ ra trong phòng kín

### 1. Bốn tín hiệu vàng của Google SRE

Sách Google SRE nêu bốn tín hiệu vàng: độ trễ, lưu lượng, lỗi và mức bão hòa. Các đầu dò coi trạm trung chuyển là một dịch vụ bên ngoài không đáng tin, và mọi cảnh báo đều dựa trên bốn tín hiệu đó.

### 2. OpenTelemetry và quy tắc SSE của W3C

Với luồng dữ liệu, chúng tôi dùng các điểm trace cho kết nối dài của OpenTelemetry và giao thức Server-Sent Events của W3C. Đầu dò ghi lại bắt tay TCP, thương lượng TLS, header, khối dữ liệu đầu tiên và tín hiệu `[DONE]`.

### 3. Khoảng tin cậy Wilson

Xếp hạng trạm theo số lần thành công / số lần thử là không công bằng. Một trạm thành công 10 trên 10 lần (100%) không mặc nhiên đáng tin hơn một trạm thành công 9.900 trên 10.000 lần (99%).

Chúng tôi dùng cận dưới của khoảng tin cậy Wilson:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ là tỷ lệ thành công quan sát được, n là cỡ mẫu, và z là phân vị chuẩn ứng với độ tin cậy 95%. Mẫu nhỏ hoặc khoảng thời gian kiểm tra ngắn sẽ bị trừ điểm.

## 5. Đầu dò được xây dựng thế nào

```text
[Đầu dò theo khu vực (AWS miền Tây Mỹ / GCP Đông Á / châu Âu)]
       │
       ├──> [Lưu lượng định kỳ và đột biến] ──> [Proxy API của trạm] ──> [API thượng nguồn / kho tài khoản]
       │                                                │
       └──< [Bộ phân tích SSE và máy trạng thái] <──────┘
               │
               ├──> [TimescaleDB / Prometheus (chỉ số cấp micro giây)]
               └──> [Điểm theo khoảng tin cậy và tự động quy nguyên nhân]
```

### 1. Đầu dò ở nhiều khu vực

Các đầu dò gọn nhẹ chạy ở AWS miền Tây Mỹ, GCP Đông Á (Hồng Kông / Tokyo) và châu Âu. Yêu cầu đồng thời từ các khu vực đó giúp phân biệt proxy của trạm bị nghẽn với dao động từ chính dịch vụ OpenAI hay Anthropic.

### 2. Máy trạng thái socket

- `CONNECTING`: ghi thời điểm gửi t0.
- `FIRST_BYTE`: khối SSE đầu tiên tới; TTFT = t1 - t0.
- `STREAMING`: khoảng cách giữa các khối, TPS và jitter.
- `COMPLETED`: payload đã kết thúc, có `[DONE]`, và JSON hợp lệ.

### 3. Tự động quy nguyên nhân

- **Gateway sập:** `502 Bad Gateway` hoặc `504 Gateway Timeout` nghĩa là chính node Nginx hoặc Envoy của trạm đã lỗi.
- **Kho tài khoản cạn:** `429 Too Many Requests` hoặc `401 Unauthorized` nghĩa là khâu kiểm soát tải đồng thời phía dưới đã thất bại, hoặc số dư khóa phía thượng nguồn đã hết.
- **Middleware:** `200 OK` nhưng luồng đứt giữa chừng hoặc phân tích thất bại nghĩa là middleware tính phí hoặc lọc prompt do trạm tự viết đã bị tràn.

## 6. Ba nguyên tắc trước khi chọn trạm

1. **Đừng tin một lần kiểm tra.** Lấy mẫu cả ngày lẫn đêm trong ít nhất 3–7 ngày. Theo dõi độ trễ P95 và tỷ lệ thành công trong giờ cao điểm ban đêm, 21:00–01:00.
2. **Bài kiểm tra phải dùng streaming.** Yêu cầu không streaming che giấu độ trễ token đầu tiên, tình trạng middleware giữ đệm và luồng chết giữa chừng.
3. **Giá rẻ bất thường không phải là quà.** Nó thường đồng nghĩa với kho tài khoản dùng chung, proxy kém chất lượng, hoặc một mô hình mã nguồn mở giá rẻ được đội lốt Opus hay GPT-4o.

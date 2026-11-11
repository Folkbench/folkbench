---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: vi
kind: article
title: "Thông số, giá niêm yết và benchmark đã công bố của Claude Opus 5.5"
description: "Thông số chính thức, giá niêm yết và bảng benchmark đã công bố của Claude Opus 5.5, kèm các yêu cầu sẽ trả về lỗi 400 khi chuyển đổi. Các số liệu lấy từ trang của hãng, không phải kết quả đo của Folkbench."
category: Mô hình
tags: [giá, benchmark, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, trang công bố Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, trang mô hình Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, điểm mới trong Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, trang mô hình Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Thông số, giá niêm yết và điểm số dưới đây được chép từ Anthropic hoặc từ các trang công khai mà hãng trích dẫn, và được đối chiếu vào ngày 2 tháng 10 năm 2026. Folkbench không chạy lại các benchmark này. Những câu như “rẻ hơn khoảng 40%” hay “khoảng một phần năm chi phí” mô tả thiết lập thử nghiệm riêng của hãng.

Claude Opus 5.5 được công bố ngày 22 tháng 9 năm 2026. Đây là mô hình đầu tiên của dòng Claude 5.5. ID mô hình trên Claude API là `claude-opus-5-5`. Trang mô hình ghi: cửa sổ ngữ cảnh 1 triệu token, đầu ra tối đa 128 nghìn token, tư duy thích ứng (adaptive thinking) luôn bật, effort mặc định là `medium`, giá niêm yết 4 USD cho mỗi triệu token đầu vào và 20 USD cho mỗi triệu token đầu ra. Các trang công khai không nêu số lượng tham số, cũng không nêu lượng tính toán dùng để huấn luyện.

Ba điểm đối chiếu trên cùng các trang này là đủ để định vị nó. Giá niêm yết thấp hơn Opus 5, và thấp hơn nhiều so với mức 10 USD / 50 USD của Fable 5.1. Ở các hàng về lập trình và công việc tri thức in trên trang công bố, Opus 5.5 dẫn trước Fable 5.1 và Opus 5, đồng thời dẫn trước GPT-6 Astra ở phần lớn các hàng đó. Có hai hàng đi theo chiều ngược lại: ước lượng điểm của Astra dẫn trước ở Terminal-Bench-Science 0.1 và AutomationBench của Zapier. Với công việc hằng ngày có phạm vi rõ ràng, hãy đọc [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Về các bậc giá ngữ cảnh dài của OpenAI, hãy đọc [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Thông số đã công bố

| Mục | Claude Opus 5.5 |
| --- | --- |
| ID mô hình trên Claude API | `claude-opus-5-5` |
| Ngày công bố | 22 tháng 9 năm 2026 |
| Cửa sổ ngữ cảnh | 1 triệu token |
| Đầu ra tối đa | 128 nghìn token |
| Đầu ra tối đa của Batch API | 300 nghìn token, header beta `output-300k-2026-03-24` |
| Đầu vào sang đầu ra | Văn bản và hình ảnh sang văn bản |
| Tư duy | Thích ứng, luôn bật |
| Effort mặc định | `medium` |
| Các giá trị effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Mức độ trễ trên trang mô hình | Trung bình |
| Mốc kiến thức đáng tin cậy | Tháng 6/2026 |
| Prompt tối thiểu có thể cache | 512 token |
| Số lượng tham số | Không có trên trang mô hình công khai |

Mốc kiến thức đáng tin cậy là thời điểm mà kiến thức sẵn có của mô hình được mô tả là vững nhất. Nó không phải cửa sổ ngữ cảnh. Tệp đính kèm trong một yêu cầu vẫn nằm trong ngữ cảnh của chính yêu cầu đó.

Fast mode là công tắc tốc độ trên cùng một ID mô hình. Trang “điểm mới” gọi nó là bản xem trước nghiên cứu (research preview) chỉ có trên Claude API. Yêu cầu đặt `speed: "fast"` và gửi header beta `fast-mode-2026-02-01`. Trang công bố định giá nó ở mức 8 USD / 40 USD cho mỗi triệu token và mô tả tốc độ đầu ra cao tới khoảng 2,5 lần, đồng thời cho biết Claude Code và Claude Platform có thể dùng nó. Trang “điểm mới” ghi rõ Amazon Bedrock, Claude Platform on AWS, Google Cloud và Microsoft Foundry không cung cấp fast mode này.

Ngân sách tư duy đặt thủ công sẽ bị từ chối. Effort là cách duy nhất để điều chỉnh độ sâu tư duy.

## Giá niêm yết

Giá tính bằng USD cho mỗi triệu token. Giá ghi cache 5 phút, ghi cache 1 giờ và giá batch của Opus 5.5 lấy từ trang “điểm mới”. Giá ghi cache của Opus 5 là ô “cache writes” duy nhất trong bảng so sánh trên trang công bố, vốn không tách riêng bậc 5 phút và 1 giờ. Giá đầu vào và đầu ra của Fable 5.1, Sonnet 5.5 và Haiku 4.5 lấy từ bảng so sánh trên trang mô hình. Sonnet 5 vẫn được đánh dấu legacy, và trang mô hình của nó ghi cùng mức giá đầu vào, đầu ra như Sonnet 5.5. Dấu gạch ngang nghĩa là bài viết này không lấy ô đó từ một hàng giá gốc.

| Mỗi 1 triệu token | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Đầu vào | $4 | $5 | $10 | $2 | $1 |
| Đầu ra | $20 | $25 | $50 | $10 | $5 |
| Đọc cache | $0,20 | $0,50 | — | $0,20 | — |
| Ghi cache | 5 phút $5; 1 giờ $8 | $6,25 | — | 5 phút $2,50; 1 giờ $4 | — |
| Batch đầu vào / đầu ra | $2 / $10 | — | — | 50% giá niêm yết | — |
| Fast mode đầu vào / đầu ra | $8 / $40 | — | — | — | — |

Giá đầu vào không qua cache và giá đầu ra thấp hơn Opus 5 20%, từ 5 USD / 25 USD xuống 4 USD / 20 USD. Trang công bố mô tả giá đọc cache giảm từ 0,50 USD xuống 0,20 USD, và cho biết các lượt đọc này chiếm phần lớn hóa đơn của công việc agent và lập trình. Anthropic còn đưa ra một nhận định về khối lượng công việc: ở thiết lập mặc định, một tác vụ điển hình tốn ít hơn Opus 5 khoảng 40% vì mô hình cũng dùng ít token hơn. Con số 40% đó mô tả thiết lập thử nghiệm riêng của hãng. Hóa đơn thực tế vẫn phụ thuộc vào effort, tỷ lệ trúng cache, số vòng gọi công cụ và việc lời gọi có dùng batch hay fast mode hay không.

Xử lý batch có giá bằng một nửa giá niêm yết mới. Fast mode có giá gấp đôi giá niêm yết mới, và trang “điểm mới” giới hạn nó ở Claude API.

Dưới đây là ba ví dụ có thể tự tính lại từ giá niêm yết. Mỗi trường hợp gồm 100.000 token đầu vào thuộc loại được nêu, cộng 5.000 token đầu ra. Hàng cache giả định bản ghi usage thực sự tính các token đó là lượt đọc.

| Yêu cầu | Phép tính | Số tiền |
| --- | --- | --- |
| 100 nghìn đầu vào không cache, 5.000 đầu ra | 0,1 × $4 + 0,005 × $20 | $0,50 |
| 100 nghìn đọc cache, 5.000 đầu ra | 0,1 × $0,20 + 0,005 × $20 | $0,12 |
| 100 nghìn ghi cache 5 phút, 5.000 đầu ra | 0,1 × $5 + 0,005 × $20 | $0,60 |

Ghi cache 1 giờ dùng mức 8 USD, không phải 5 USD như trên. Giá của trạm trung chuyển hay của nền tảng đám mây không có trong bảng này.

## Những gì thay đổi so với Opus 5 và Fable 5.1

| Hành vi | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Ngữ cảnh / đầu ra tối đa | 1 triệu / 128 nghìn | 1 triệu / 128 nghìn | 1 triệu / 128 nghìn |
| Tư duy | Luôn bật. `disabled` và ngân sách thủ công trả về 400 | Bật theo mặc định. `disabled` được chấp nhận ở effort `high` hoặc thấp hơn | Trang mô hình ghi là luôn bật |
| Mặc định khi bỏ trống effort | `medium` | `high` | `high` |
| Mốc kiến thức đáng tin cậy | Tháng 6/2026 | Không trích dẫn riêng ở đây | Tháng 6/2026 |
| Giá niêm yết đầu vào / đầu ra | $4 / $20 | $5 / $25 | $10 / $50 |
| Đọc cache | $0,20 | $0,50 | — |

Trang “điểm mới” gom bốn thay đổi khiến mã viết cho Opus 5 bị lỗi. Ba thay đổi đầu cũng áp dụng cho Fable 5.1. Nếu chỉ thay chuỗi tên mô hình, bạn vẫn sẽ vướng phải chúng.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking có type là disabled, hoặc enabled kèm budget_tokens
# 400: tool_choice là any, hoặc tool_choice là tool
# 400, chỉ trên Claude API và Google Cloud: loại công cụ computer_20251124
```

Bỏ `thinking`, hoặc gửi `adaptive`; hai cách này tương đương. Các giá trị `auto` và `none` của `tool_choice` vẫn hoạt động, kể cả trên endpoint đếm token. Để có JSON hợp lệ theo schema, trang “điểm mới” khuyên dùng gọi công cụ ở chế độ nghiêm ngặt (strict tool use) hoặc đầu ra có cấu trúc (structured outputs), và nói rõ trong prompt khi nào cần dùng công cụ.

Trên Claude API và Google Cloud, hãy thay `computer_20251124` bằng `computer_toolset_20260801` và bỏ header beta cũ của computer use. Trang “điểm mới” cho biết Opus 5.5 trên Amazon Bedrock vẫn chấp nhận `computer_20251124`. Tích hợp nào đã dùng bộ công cụ mới thì không cần sửa mã cho thay đổi này.

Lỗi 400 thứ tư liên quan đến ràng buộc khối tư duy (thinking block). Với tài khoản tạo từ 00:00 UTC ngày 31 tháng 8 năm 2026 trở đi, trên Claude API và các nền tảng đám mây, việc phát lại một khối tư duy của Opus 5.5 sẽ trả về 400 nếu system prompt, danh sách công cụ hoặc một tin nhắn trước đó bị thay đổi sau khi khối đó được tạo ra. Cách làm theo tài liệu là giữ lịch sử ở dạng chỉ nối thêm (append-only). Khi buộc phải đổi chỉ dẫn, hãy dùng một system message chèn giữa hội thoại. Các tài khoản cũ hơn phải chủ động bật cùng cơ chế kiểm tra này.

Có ba hành vi thay đổi ngay cả khi yêu cầu thành công. Bỏ trống effort giờ sẽ chạy ở `medium`; cũng bỏ trống như vậy, Opus 5 chạy ở `high`. Ở cùng một mức effort, Opus 5.5 có xu hướng tư duy nhiều hơn Opus 5 trong mỗi lượt, rõ nhất ở `xhigh` và `max`. Một giá trị effort chép từ cấu hình cũ là một điểm chi phí mới, và `max_tokens` phải chừa chỗ cho các khối tư duy.

Văn bản viết giữa các lần gọi công cụ được trả về bên trong khối tư duy. Với giá trị display mặc định là `omitted`, các khối này có văn bản rỗng. Giao diện nào trước đây stream đoạn văn bản đó làm thông báo tiến độ sẽ trở nên im lặng, trong khi yêu cầu vẫn thành công. Sản phẩm cần các dòng tiến độ phải đặt giá trị display và chọn khối theo `type`, không theo vị trí.

Một bộ phân loại sinh học chạy song song với bộ phân loại an ninh mạng. Prompt thúc mô hình chép phần suy luận vào câu trả lời hiển thị có thể bị từ chối với lý do `reasoning_extraction`. Trang “điểm mới” cũng cho biết biểu đồ và ảnh chụp màn hình được đọc chính xác hơn ngay cả trước khi thêm công cụ thị giác, nên các prompt từng được viết để bù cho khả năng đọc ảnh yếu hơn đáng được phát lại riêng.

Yêu cầu bị từ chối trả về HTTP 200 với `stop_reason` là `"refusal"`. Đó không phải lỗi truyền tải. Có bị tính phí hay không tùy vào loại từ chối, và nó vẫn bị tính vào giới hạn tốc độ.

## Cách đọc benchmark trên trang công bố

Bảng dưới đây là bảng in trên trang công bố khi đối chiếu ngày 2 tháng 10 năm 2026. Trừ khi chú thích nói khác, Opus 5.5 dùng tư duy thích ứng ở effort max. Terminal-Bench 4.0 chính là chú thích đó: Opus 5.5 ở `xhigh`, GPT-6 Astra ở `high`, và mỗi ô là điểm cao nhất đã công bố của mô hình tương ứng. Số liệu của Astra và GPT-5.6 Sol được trích từ báo cáo của OpenAI. Cơ chế bảo vệ (safeguards) của môi trường production được bật. Khi chúng can thiệp, tác vụ an ninh mạng do Opus 4.8 hoàn thành, còn tác vụ sinh học và phát triển LLM tiên phong do Opus 5 hoàn thành. Anthropic cho biết điều này kéo điểm của Opus 5.5 xuống.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66,4% | 55,8% | 52,3% | 57,9% | 37,3% |
| FrontierCode v1.1 (Main) | 54,4% | 50,3% | 48,0% | 53,3% | 47,5% |
| CursorBench 4.0 | 57,8% | 51,8% | 46,6% | — | 41,7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40,0% | 31,4% | 26,9% | 41,4% | 28,8% |
| Humanity's Last Exam, có dùng công cụ | 67,7% | 65,6% | 63,6% | 57,2% | — |
| Terminal-Bench-Science 0.1 | 58,7% | 52,6% | 29,0% | 64,6% | 22,4% |
| OSWorld 2.1, partial | 81,8% | 80,7% | 74,0% | — | — |
| Chartography, có dùng công cụ | 89,0% | 88,4% | 83,4% | — | — |

Hãy đọc các khoảng cách cạnh sai số đã công bố. Trên Terminal-Bench 4.0, Opus 5.5 có sai số ±2,6 điểm, các mô hình Claude khác từ ±1,6 đến ±2 điểm. Khoảng cách từ 66,4% xuống 57,9% của Astra, và xuống 55,8% của Fable, đều rộng hơn các sai số đó. Cùng chú thích ấy cho biết bảng xếp hạng công khai ghi Opus 5 đạt 51,8%, còn thiết lập của họ tái lập được 52,3%, nằm trong mức nhiễu.

Terminal-Bench-Science có sai số từ ±3,5 đến ±5 điểm cho mỗi mô hình. Mức 64,6% của Astra so với 58,7% của Opus 5.5 gần bằng độ rộng của các sai số đó. Theo ước lượng điểm, Astra đứng trước. Bảng xếp hạng công khai ghi Opus 5 đạt 30,0%, còn thiết lập của họ tái lập được 29,0%.

AutomationBench do Zapier vận hành. Vì lần chạy đó không có mô hình dự phòng, mỗi lần cơ chế bảo vệ can thiệp đều bị tính là thất bại. Anthropic cho rằng điểm thực tế sẽ cao hơn. Mức 40,0% được in so với 41,4% của Astra là một kết quả công bố rất sát nhau, và theo ước lượng điểm, Astra đứng trước. GDPval-AA v2.1 là điểm Elo trên các tác vụ chuyên môn thực tế thuộc 44 nghề nghiệp: Opus 5.5 đạt 1846, Fable 5.1 đạt 1735, Opus 5 đạt 1708, Sol đạt 1588 và Astra đạt 1542.

Các biểu đồ chi phí trên cùng trang in một cặp điểm thứ hai ở effort mặc định `medium`: FrontierCode 54,6% và CursorBench 52,5%. Bảng so sánh in 54,4% và 57,8%. Hãy coi chúng là hai con số ở hai mức effort khác nhau. Chú thích biểu đồ cũng nói rằng, ở effort medium, FrontierCode vượt điểm cao nhất 53,3% của Astra với khoảng một phần năm chi phí mỗi tác vụ, còn Terminal-Bench ngang Astra với khoảng 40% chi phí. Đó là các nhận định về chi phí mỗi tác vụ trên thiết lập thử nghiệm riêng của Anthropic.

Câu đáng giữ lại là câu ngay dưới bảng: trong quá trình tự sử dụng của Anthropic, khoảng cách giữa Opus 5.5 và Fable 5.1 hẹp hơn mức điểm số gợi ra, và ở trình độ này, chênh lệch benchmark là chỉ dẫn kém tin cậy hơn cho tác vụ thực tế. Các trích dẫn khách hàng trên trang công bố là lời chứng đã được chọn lọc. Chúng có thể gợi ý nên phát lại những gì, nhưng không thuộc về bảng.

## Kiểm tra trước khi chuyển lưu lượng

1. Cố định `claude-opus-5-5`. Kiểm tra cả tên mô hình trong kết quả hoàn tất. Khi cơ chế bảo vệ can thiệp, tác vụ an ninh mạng có thể do Opus 4.8 hoàn thành, còn tác vụ sinh học hoặc phát triển LLM tiên phong có thể do Opus 5 hoàn thành. Mô hình được yêu cầu trong log vẫn có thể ghi là `claude-opus-5-5`.
2. Phát lại một bộ dữ liệu không chứa thông tin nhạy cảm ở `low`, `medium`, `high`, `xhigh` và `max`. Ghi lại kết quả thành công, thời gian thực tế (wall time), đầu vào, đọc cache, ghi cache, đầu ra và chi phí.
3. Không gửi `thinking: {"type": "disabled"}` hay ngân sách thủ công với `budget_tokens`. Đặt effort một cách tường minh. Nếu bỏ trống, ở đây sẽ chạy `medium`, không phải `high` như Opus 5.
4. Chỉ dùng `auto` hoặc `none` cho `tool_choice`. Trên Claude API và Google Cloud, computer use chuyển sang `computer_toolset_20260801`.
5. Giữ các hội thoại có phát lại khối tư duy ở dạng chỉ nối thêm. Tài khoản tạo từ ngày 31 tháng 8 năm 2026 trở đi sẽ nhận lỗi 400 nếu phần tiền tố trước một khối tư duy của Opus 5.5 bị thay đổi.
6. Đếm riêng các lần từ chối trả về HTTP 200, tách khỏi lỗi truyền tải.
7. Kiểm tra số tiền bị tính bằng một prompt ngắn và một prompt lẽ ra phải trúng cache. Ghi cache 5 phút, ghi cache 1 giờ, batch và fast mode là bốn bảng giá khác nhau.
8. Với công việc có phạm vi rõ ràng, không cần đến vòng lặp Opus này, hãy giữ mức giá 2 USD / 10 USD của [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Ở các tác vụ agent khoa học và quy trình nghiệp vụ của Zapier, ước lượng điểm được in cho thấy Astra đứng trước.

Sau khi chọn được mô hình, việc một trạm trung chuyển có cung cấp ID này hay không, cùng tỷ lệ khả dụng và giá đã công bố của trạm đó, đều lấy từ bản ghi trong danh mục. Bài viết này không so sánh các trạm, và không biến giá niêm yết của hãng thành giá mà một trạm thực thu.

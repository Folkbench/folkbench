---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: vi
kind: article
title: "Claude Sonnet 5.5: thông số, giá niêm yết và benchmark trên trang công bố"
description: "Tổng hợp thông số chính thức, mức giá niêm yết giống Sonnet 5 và bảng benchmark trên trang công bố của Claude Sonnet 5.5, kèm các yêu cầu sẽ trả về 400 khi chuyển đổi. Các con số này không phải do Folkbench đo."
category: Mô hình
tags: [giá, benchmark, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, trang công bố Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, trang mô hình Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, điểm mới của Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, chuyển sang Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, trang mô hình Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Thông số, giá niêm yết và điểm số dưới đây được chép từ các trang công khai của Anthropic, đối chiếu ngày 2 tháng 10 năm 2026. Folkbench không chạy lại các benchmark này. Những câu như “rẻ hơn tới 30%” hay “nhanh hơn trên 30%” mô tả hệ thống thử nghiệm riêng của hãng.

Claude Sonnet 5.5 ra mắt ngày 28 tháng 9 năm 2026, là mô hình thứ hai của dòng Claude 5.5. ID mô hình trên Claude API là `claude-sonnet-5-5`. Anthropic đặt nó cạnh [Opus 5.5](../claude-opus-5-5-review-pricing/): tác vụ thường ngày có phạm vi rõ ràng, sửa lỗi, cùng tài liệu, slide và bảng tính thì dùng mô hình này; với công việc phức tạp, mở, cần phán đoán liên tục, chính trang công bố vẫn viết rằng Opus 5.5 mạnh hơn. Giá niêm yết giống Sonnet 5: 2 USD cho mỗi triệu token đầu vào, 10 USD cho mỗi triệu token đầu ra và 0,20 USD cho mỗi triệu token đọc cache.

Cả hai trang công bố đều ghi Haiku 5.5 sẽ ra mắt trong vài tuần tới. Bài này không ghi giá cho một ID chưa xuất hiện trong bảng giá.

## Thông số đã công bố

| Mục | Claude Sonnet 5.5 |
| --- | --- |
| ID mô hình trên Claude API | `claude-sonnet-5-5` |
| Ngày ra mắt | 28/9/2026 |
| Ngữ cảnh / đầu ra tối đa (đồng bộ) | 1M / 128K token |
| Đầu vào → đầu ra | Văn bản và hình ảnh → văn bản |
| Suy nghĩ (thinking) | Thích ứng (adaptive), bật mặc định |
| Effort mặc định trên Claude API | `high` |
| Effort mặc định trong ứng dụng Claude và Claude Code | `medium` |
| Các giá trị effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Mức độ trễ trên trang mô hình | Fast. Đây là so sánh trong dòng sản phẩm Claude hiện tại, không phải số đo token/giây |
| Mốc kiến thức đáng tin cậy | Tháng 6/2026 |
| Độ dài tối thiểu của prompt có thể cache | 512 token |
| Bộ tách token (tokenizer) | Giống Sonnet 5, nên cùng một đoạn văn bản cho ra cùng số token |

Trang mô hình Sonnet 5 vẫn ghi mô hình này là legacy và còn khả dụng, giá đầu vào và đầu ra vẫn là 2 USD / 10 USD, mốc kiến thức đáng tin cậy là tháng 1/2026. Cam kết ngừng hỗ trợ ghi là không sớm hơn ngày 30 tháng 6 năm 2027. Trang điểm mới của Sonnet 5.5 khuyến nghị chuyển sang 5.5.

Mức thấp nhất để tắt suy nghĩ trước khi trả lời là `thinking: {"type": "between_tools"}`, và mức này chỉ được chấp nhận ở `low`, `medium` và `high`. Với `xhigh` và `max`, phải quay lại suy nghĩ thích ứng. Hướng dẫn chuyển đổi ghi rõ: đặt `temperature`, `top_p` hoặc `top_k` khác giá trị mặc định sẽ trả về 400.

## Giá niêm yết

Đơn vị là USD cho mỗi triệu token. Cột Sonnet 5.5 lấy từ trang mô hình. Giá đầu vào, đầu ra và đọc cache của Opus 5.5 lấy từ bảng so sánh trên cùng trang công bố. Trang điểm mới ghi rằng Sonnet 5.5 giữ nguyên giá của Sonnet 5, bao gồm cả cache prompt và xử lý theo lô (batch). Chiết khấu batch là 50% cho cả đầu vào và đầu ra.

| Mỗi 1 triệu token | Sonnet 5.5 | Opus 5.5 trên trang công bố |
| --- | --- | --- |
| Đầu vào | 2 USD | 4 USD |
| Đầu ra | 10 USD | 20 USD |
| Đọc cache | 0,20 USD | 0,20 USD |
| Ghi cache | 5 phút: 2,50 USD; 1 giờ: 4 USD | Trang công bố in thành một mức 5 USD; trang điểm mới tách Opus 5.5 thành 5 phút 5 USD và 1 giờ 8 USD |
| Đầu vào / đầu ra batch | 50% giá niêm yết | Bảng so sánh trên trang công bố không có |

So với Opus 5.5, giá đầu vào và đầu ra chỉ bằng một nửa. Đọc cache của cả hai đều là 0,20 USD. Trang công bố in giá ghi cache của Opus 5.5 thành một mức 5 USD, không tách 5 phút và 1 giờ. Trang mô hình Sonnet 5.5 thì tách riêng hai mức của chính nó.

Anthropic còn đưa ra hai nhận định về khối lượng công việc: cùng một việc thường tốn ít token hơn, phần lớn tác vụ rẻ hơn tới 30%; tốc độ sinh đầu ra nhanh hơn Sonnet 5 trên 30%. Biểu đồ chi phí còn có các so sánh chi phí mỗi tác vụ ở mức “khoảng một phần mười”, “khoảng một phần năm”, “khoảng một phần mười lăm” và “khoảng một phần chín”. Đó đều là kết quả trong hệ thống thử nghiệm của hãng. Hóa đơn thực tế vẫn phụ thuộc vào effort, mức trúng cache, số vòng gọi công cụ và việc có dùng batch hay không.

Dưới đây là ba ví dụ có thể tự tính lại từ giá niêm yết. Mỗi ví dụ gồm 100 nghìn token đầu vào thuộc loại tương ứng, cộng 5.000 token đầu ra.

| Yêu cầu | Phép tính | Số tiền |
| --- | --- | --- |
| 100 nghìn đầu vào không cache, 5.000 đầu ra | 0,1 × 2 USD + 0,005 × 10 USD | 0,25 USD |
| 100 nghìn đọc cache, 5.000 đầu ra | 0,1 × 0,20 USD + 0,005 × 10 USD | 0,07 USD |
| 100 nghìn ghi cache 5 phút, 5.000 đầu ra | 0,1 × 2,50 USD + 0,005 × 10 USD | 0,30 USD |

Dòng thứ ba dùng giá ghi 5 phút, không phải mức 4 USD của loại 1 giờ. Ghi cache 1 giờ là 0,1 × 4 USD + 0,005 × 10 USD = 0,45 USD.

## Nên đọc bảng benchmark trên trang công bố thế nào

Bảng dưới đây chính là bảng in trên trang công bố, đối chiếu ngày 2 tháng 10 năm 2026. Dấu gạch ngang là ô trống của chính trang đó. Biểu đồ chi phí của Terminal-Bench 4.0 và CursorBench 4.0 dùng GPT-5.6 Sol, vì OpenAI không công bố hai điểm này cho GPT-6 Sol. Bài này không điền điểm GPT-5.6 Sol trên biểu đồ vào cột GPT-6 Sol.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70,6% | 10,3% | 66,4% | — |
| FrontierCode v1.1 (Main) | 46,2% (max); 52,1% (xhigh) | 42,4% | 54,4% | 49,3% |
| CursorBench 4.0 | 55,5% | 34,1% | 57,8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, có dùng công cụ | 64,5% | 54,9% | 67,7% | — |
| OSWorld 2.1, partial | 80,1% | 57,0% | 81,8% | — |
| Chartography, không dùng công cụ | 61,6% | 15,6% | 64,4% | 53,6% |

Dòng Chartography này là điểm không dùng công cụ. Dòng Chartography trên trang công bố Opus 5.5 là một phép đo khác có dùng công cụ, ở đó Opus 5.5 đạt 89,0%; không thể đặt con số đó cạnh mức 64,4% ở đây như thể cùng một lần đo.

Cần đọc chú thích cùng với điểm số. Ô Terminal-Bench 4.0 của Opus 5.5 là ở mức xhigh, và trang công bố gọi đây là điểm cao nhất của mô hình này. Trên FrontierCode, Sonnet 5.5 ở mức max thấp hơn ở mức xhigh. Trang công bố giải thích: ở mức max, mô hình thường chạy thêm bước review code hơn; khi bước review được chia cho nhiều agent con, trong các trường hợp Cognition đã xem xét, có lúc dẫn đến hết thời gian chờ, có lúc dẫn đến chỉnh sửa vượt ra ngoài phạm vi tác vụ, mà bài đánh giá này lại phạt chỉnh sửa ngoài phạm vi.

Artificial Analysis chạy GDPval-AA và AA-Briefcase trên một bản triển khai trước khi phát hành. Bản triển khai đó có một lỗi có thể làm giảm chất lượng đầu ra có cấu trúc. Trang công bố cho biết lỗi này sau đó đã được sửa, và nếu có ảnh hưởng thì theo hướng đánh giá thấp Sonnet 5.5. Các ô GDPval-AA, AA-Briefcase và Chartography ở cột GPT-6 Sol còn kèm một chú thích khác: OpenAI từng sửa một lỗi làm giảm khả năng hiểu hình ảnh, và các điểm số bên ngoài này khi đó chưa chắc đã được cập nhật.

Biểu đồ chi phí trên cùng trang là một cách đọc khác. Mức effort Medium là mặc định trong ứng dụng Claude. Trên một số benchmark, Sonnet 5.5 ở mức Low hoặc Medium vượt điểm tốt nhất của Sonnet 5 với chi phí mỗi tác vụ chỉ khoảng một phần mười. Mức effort High là mặc định trên Claude Platform. Trang công bố viết rằng FrontierCode ở mức High cao hơn Sonnet 5 cùng mức khoảng 10 điểm, với chi phí mỗi tác vụ khoảng một phần mười lăm, đồng thời ngang điểm tốt nhất của GPT-6 Sol với chi phí khoảng một phần năm. CursorBench ở mức Low vượt điểm tốt nhất của Sonnet 5 với chi phí chưa tới một phần mười. AA-Briefcase ở mức Medium vượt điểm tốt nhất của Sonnet 5 với chi phí khoảng một phần chín.

Các con số 55,5% và 1844 trong bảng là những điểm do trang công bố in ra. Các câu về chi phí đến từ một hệ thống thử nghiệm khác. Trang công bố đồng thời ghi rằng, trong quá trình Anthropic tự sử dụng và trong thử nghiệm bên ngoài, Opus 5.5 vẫn mạnh hơn ở công việc phức tạp, mở, cần phán đoán liên tục. Trích dẫn của khách hàng là lời chứng thực đã được chọn lọc, không thuộc bảng này. Trang công bố còn viết đây là mẫu Sonnet đầu tiên hoàn thành Pokémon Red chỉ nhờ ảnh chụp màn hình. Đó là câu chuyện sản phẩm, không phải một dòng trong bảng trên.

## Chuyển từ Sonnet 5 sang

Trang điểm mới liệt kê năm thay đổi khiến mã vốn chạy trên Sonnet 5 trả về 400. Ngoài ra còn những trường hợp yêu cầu vẫn thành công nhưng cấu trúc phản hồi đã thay đổi.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: kiểu thinking là disabled
# 400: kiểu thinking là enabled, kèm budget_tokens
# 400: kiểu thinking là between_tools với effort xhigh hoặc max
# 400: tool_choice là any, hoặc tool_choice là tool
# 400: temperature, top_p, top_k khác giá trị mặc định
# 400, chỉ trên Claude API và Google Cloud: loại công cụ computer_20251124
# 400: công cụ cố vấn dùng Opus 4.8, Opus 4.7 hoặc Sonnet 5 làm cố vấn
```

Để tắt suy nghĩ trước khi trả lời, hãy gửi `between_tools` và giữ effort ở `high` hoặc thấp hơn. `between_tools` không được kèm thêm `display`, `budget_tokens` hay `block_binding`. Tiếp tục để `tool_choice` là `auto` hoặc `none`. Muốn tham số công cụ khớp schema, hãy bật gọi công cụ nghiêm ngặt (strict tool use) hoặc chuyển sang đầu ra có cấu trúc, và ghi rõ trong prompt khi nào cần gọi công cụ.

Tính năng điều khiển máy tính (computer use) trên Claude API và Google Cloud chuyển sang `computer_toolset_20260801`. Trang điểm mới ghi rõ Amazon Bedrock vẫn chấp nhận `computer_20251124` như cũ.

Công cụ cố vấn (advisor) chấp nhận Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5, hoặc chính Sonnet 5.5. Opus 4.8, Opus 4.7 và Sonnet 5 có thể làm cố vấn cho Sonnet 5, nhưng không thể làm cố vấn cho Sonnet 5.5. Nội dung cố vấn trả về được mã hóa, phía client không đọc được văn bản.

Với tài khoản tạo từ 00:00 UTC ngày 31 tháng 8 năm 2026 trở đi, trên Claude API, Amazon Bedrock và Google Cloud còn một trường hợp 400 nữa: khi phát lại khối suy nghĩ (thinking block) của Sonnet 5.5, nếu system prompt, danh sách công cụ hoặc các tin nhắn trước đó đã bị sửa, yêu cầu sẽ thất bại. Hãy giữ hội thoại ở dạng chỉ nối thêm (append-only). Khi buộc phải đổi chỉ dẫn, hãy dùng system message giữa hội thoại.

Khi bỏ qua effort, API chạy ở `high`. Cùng một mức tên gọi nhưng lượng suy nghĩ không tương đương với Sonnet 5. Trang điểm mới yêu cầu quét lại effort từ đầu thay vì chép cấu hình cũ sang. Vòng lặp công cụ có phạm vi rõ ràng có thể bắt đầu từ `medium`, rồi nâng lên `high` khi tác vụ dài hơn hoặc khó hơn. Hội thoại nhạy cảm với độ trễ thì bắt đầu từ `medium` hoặc `low`. Ứng dụng Claude và Claude Code đã mặc định `medium`, còn Claude Platform mặc định `high`.

Văn bản báo tiến độ dài hơn một hai câu giữa các lần gọi công cụ sẽ quay về bên trong khối suy nghĩ. Với giá trị display mặc định là `omitted`, phần văn bản của các khối này để trống, nên giao diện im lặng giữa các lần gọi công cụ dù yêu cầu vẫn thành công. Khi dùng `between_tools`, đoạn văn bản này trả về dưới dạng tóm tắt trong khối suy nghĩ, còn khi phát lại, mô hình thấy toàn bộ ghi chú.

Khối suy nghĩ ghi lại mô hình đã tạo ra nó. Trang điểm mới ghi rằng Sonnet 5.5 đọc được khối suy nghĩ của Sonnet 5, Opus 4.8, Haiku 4.5 và các mô hình cũ hơn, nhưng không đọc khối của Opus 5, Opus 5.5, Fable hay Mythos. Trên Claude API và Google Cloud, Opus 5.5 đọc được khối suy nghĩ của Sonnet 5.5, các mô hình hiện hành khác thì không. Khối mà mô hình đích không đọc được sẽ bị loại bỏ trước khi mô hình nhìn thấy; yêu cầu vẫn thành công và các khối bị loại không bị tính phí.

Yêu cầu bị từ chối vẫn trả về HTTP 200, với `stop_reason` là `"refusal"`. Trang công bố ghi rằng năng lực an ninh mạng của mô hình đã tiệm cận Opus 5, vì vậy đây là mẫu Sonnet đầu tiên ra mắt kèm lớp bảo vệ an ninh mạng cùng loại. Các tác vụ an ninh mạng rủi ro cao hơn sẽ được chuyển về Sonnet 5. Lớp bảo vệ về sinh học giống Sonnet 5. Phát triển phần mềm thông thường và phần lớn công việc khoa học sự sống nằm ngoài hai lớp bảo vệ hẹp này. Trang công bố cũng ghi rằng Sonnet 5.5 có thể được cung cấp với chế độ không lưu giữ dữ liệu (zero data retention).

## Cần kiểm tra gì trước khi chuyển lưu lượng

1. Cố định `claude-sonnet-5-5`. Kiểm tra cả tên mô hình trong kết quả trả về: khi lớp bảo vệ an ninh mạng chuyển về mô hình dự phòng, mô hình trả lời có thể là Sonnet 5.
2. Dùng cùng một bộ dữ liệu không chứa thông tin nhạy cảm, phát lại lần lượt ở `low`, `medium`, `high`, `xhigh` và `max`. Ghi lại tỷ lệ thành công, độ trễ, đầu vào, đọc cache, ghi cache, đầu ra và chi phí.
3. Đặt effort trong `output_config.effort`. Không dùng `budget_tokens` thủ công để đặt mức suy nghĩ cho mô hình này.
4. Các client vốn gửi `disabled`, ép chọn công cụ, tham số lấy mẫu hoặc `computer_20251124` cần được sửa trước khi tăng lưu lượng. Công cụ điều khiển máy tính cũ trên Bedrock là ngoại lệ.
5. Giữ các hội thoại có phát lại khối suy nghĩ ở dạng chỉ nối thêm.
6. Đếm riêng các lần từ chối trả về HTTP 200 và các lỗi truyền tải.
7. Dùng một prompt ngắn và một prompt sẽ trúng cache để đối chiếu số tiền bị tính. Ghi cache 5 phút, ghi cache 1 giờ và chiết khấu 50% của batch là các bảng giá khác nhau.
8. Tác vụ phức tạp, mở, cần phán đoán liên tục thì tiếp tục dùng `claude-opus-5-5`. Trang mô hình Sonnet 5 vẫn ghi `claude-sonnet-5` là còn khả dụng. Các bậc giá phía OpenAI xem tại [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Sau khi đã chọn mô hình, việc trạm trung chuyển nào cung cấp ID này, cùng tỷ lệ khả dụng và giá tại thời điểm đó, hãy lấy theo bản ghi đã công bố trong danh mục. Bài này không so sánh các trạm.

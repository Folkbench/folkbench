---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: vi
kind: article
title: Thông số, giá ngữ cảnh dài và điểm chuẩn đã công bố của Grok 4.7
description: "Tên mô hình chính thức, ngữ cảnh 500K, giá niêm yết dưới và trên 200K token prompt, cùng bảng điểm chuẩn được công bố cho Grok 4.7. Các số liệu này lấy từ trang công khai của xAI, không phải kết quả đo của Folkbench."
category: Mô hình
tags: [giá, đánh giá chuẩn, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, trang công bố Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: Tài liệu xAI, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: Tài liệu xAI, trang mô hình Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: Bảng giá xAI API
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Thông số và giá dưới đây lấy từ tài liệu và bảng giá của xAI. Điểm chuẩn lấy từ trang công bố ngày 21 tháng 9 năm 2026. Chúng tôi đã đối chiếu vào ngày 2 tháng 10 năm 2026. Folkbench không chạy lại các bài đánh giá này. Giá và điểm của đối thủ trên trang công bố là số liệu mà trang đó in ra, không phải kết quả đối chiếu lại bảng giá của OpenAI hay Anthropic trong cùng ngày.

xAI công bố Grok 4.7 vào ngày 21 tháng 9 năm 2026. Tên mô hình trên API là `grok-4.7`. Tài liệu mô tả đây là mô hình hàng đầu cho lập trình, tác vụ agent và công việc tri thức. Phần nội dung trang công bố ghi rằng mô hình này có cùng giá và cùng tốc độ với [Grok 4.6](https://x.ai/news/grok-4-6). Tiêu đề của chính trang đó lại nói nó nhanh gấp khoảng hai lần, với giá khoảng một nửa so với các mô hình cùng hạng. Cả hai câu đều nằm trên trang công bố. Bài viết này không biến câu tiêu đề thành một bảng giá khác.

Có ba trang công khai có thể đối chiếu với nhau. Bảng tóm tắt trong tài liệu ghi cửa sổ ngữ cảnh 500.000 token, mốc kiến thức tháng 5/2026, và giá ngữ cảnh ngắn là 2 USD đầu vào, 6 USD đầu ra. Bảng giá chuyển sang đơn giá ngữ cảnh dài khi prompt đạt 200K token, và đơn giá đó áp dụng cho toàn bộ yêu cầu. Bảng điểm chuẩn trên trang công bố đặt `grok-4.7` cạnh Grok 4.6, GPT-5.6 Sol và Fable 5.1. Về các mức giá ngữ cảnh dài của OpenAI, xem [GPT-6.1 Sol](https://folkbench.com/vi/blog/gpt-6-1-sol-review-pricing). Về Claude, xem [Opus 5.5](https://folkbench.com/vi/blog/claude-opus-5-5-review-pricing) và [Sonnet 5.5](https://folkbench.com/vi/blog/claude-sonnet-5-5-review-pricing).

## Thông số đã công bố

| Mục | Grok 4.7 |
| --- | --- |
| Tên mô hình | `grok-4.7` |
| Ngày công bố | Ngày 21 tháng 9 năm 2026 |
| Cửa sổ ngữ cảnh | 500.000 token |
| Mốc kiến thức | Tháng 5/2026 |
| Đầu vào sang đầu ra | Văn bản và hình ảnh sang văn bản |
| Giới hạn đầu ra trên bảng tóm tắt | Ghi là không giới hạn đầu ra văn bản, không nêu riêng số token đầu ra tối đa |
| Suy luận | `low`, `medium`, `high` (mặc định), `xhigh` |
| API | Responses, Chat Completions |
| Công cụ được nêu trong tài liệu | Gọi hàm, tìm kiếm web, tìm kiếm X, thực thi mã |
| Batch API trên trang mô hình | Không hỗ trợ |

Trang mô hình đặt mức effort mặc định là `high`. Tài liệu khuyên dùng `prompt_cache_key` trên Responses API và header `x-grok-conv-id` trên Chat Completions. Theo trang này, nếu thiếu khóa đó, một cuộc hội thoại thường rơi vào máy chủ chưa có cache và đầu vào bị tính theo giá không cache. Responses còn trả về `reasoning.encrypted_content` kể cả khi yêu cầu không liệt kê nó trong `include`. Các lệnh gọi nhiều lượt nên gửi lại nguyên vẹn các mục reasoning đó trong `input` tiếp theo. Tài liệu cho biết Chat Completions không thay đổi ở điểm này.

Tài liệu liệt kê xAI API, endpoint khu vực Mỹ `https://us.api.x.ai/v1`, Grok Build, Cursor, cùng các gateway OpenRouter, Vercel và Cloudflare. Mô hình mặc định của Grok Build chính là mô hình này. Endpoint khu vực Mỹ hiện ghi tên `grok-4.7` và `grok-4.6`. Một trạm trung chuyển có niêm yết ID này hay không là bản ghi đã công bố trong danh mục, không phải điều bài viết này khẳng định.

## Giá chính thức

### Ngữ cảnh ngắn và ngữ cảnh dài

Giá tính bằng USD cho mỗi 1 triệu token, lấy từ bảng giá API đọc ngày 2 tháng 10 năm 2026. Bảng giá ghi ngưỡng ngữ cảnh dài là prompt đạt 200K token. Khi một yêu cầu chạm ngưỡng này, mọi token trong yêu cầu đó đều dùng đơn giá ngữ cảnh dài. `grok-4.7` và `grok-4.6` có chung sáu ô giá trên bảng này.

| Mỗi 1 triệu token | 4.7 ngắn | 4.7 dài | 4.6 ngắn | 4.6 dài |
| --- | --- | --- | --- | --- |
| Đầu vào | 2 USD | 4 USD | 2 USD | 4 USD |
| Đọc cache | 0,50 USD | 1 USD | 0,50 USD | 1 USD |
| Đầu ra | 6 USD | 12 USD | 6 USD | 12 USD |

Prompt dưới 200K dùng mức ngắn. Kể từ yêu cầu chạm 200K, cả những token phía trước cũng tính theo đơn giá mức dài. Mức dài gấp đôi mức ngắn: 2 USD × 2 = 4 USD, cache 0,50 USD × 2 = 1 USD, đầu ra 6 USD × 2 = 12 USD. Đọc cache bằng một phần tư giá đầu vào cùng mức: 2 USD × 0,25 = 0,50 USD và 4 USD × 0,25 = 1 USD.

Ba ví dụ chỉ dùng mức tiêu chuẩn. Hai ví dụ đầu nằm trong mức ngắn. Ví dụ thứ ba có 280.000 token đầu vào, nên toàn bộ yêu cầu dùng mức dài. Dòng có cache giả định bản ghi usage tính phần đầu vào đó là trúng cache.

| Yêu cầu | Phép tính | Số tiền |
| --- | --- | --- |
| 100.000 token đầu vào không cache, 5.000 token đầu ra | 0,1 × 2 USD + 0,005 × 6 USD | 0,23 USD |
| 100.000 token đọc cache, 5.000 token đầu ra | 0,1 × 0,50 USD + 0,005 × 6 USD | 0,08 USD |
| 280.000 token đầu vào không cache, 10.000 token đầu ra | 0,28 × 4 USD + 0,01 × 12 USD | 1,24 USD |

Nếu tính nhầm 280.000 token đó theo đơn giá mức ngắn, bạn sẽ được 0,28 × 2 USD + 0,01 × 6 USD = 0,62 USD. Đó không phải giá của mức này. Ba dòng trên chưa nhân thêm Fast, phụ phí khu vực Mỹ hay phí gọi công cụ.

### Các hệ số khác trên bảng giá

Endpoint khu vực Mỹ `https://us.api.x.ai/v1` giữ việc suy luận trong lãnh thổ Mỹ và tính token bằng 1,1 lần đơn giá toàn cầu, tức phụ phí 10%. Bảng giá in ra các kết quả sau cho `grok-4.7`: dưới 200K, đầu vào 2,20 USD, đọc cache 0,55 USD, đầu ra 6,60 USD; trên 200K, đầu vào 4,40 USD, đọc cache 1,10 USD, đầu ra 13,20 USD. Hệ số 1,1 áp dụng cho đầu vào, đầu ra và đọc cache, kể cả ở mức dài. Chiết khấu cache được áp dụng trước.

Grok 4.7 Fast là cùng mô hình đó chạy trên hạ tầng nhanh hơn. Tài liệu ghi rằng yêu cầu tiêu chuẩn tính gấp 2 lần và yêu cầu ngữ cảnh dài tính gấp 1,5 lần. Bản này chỉ có trong Cursor và Grok Build, tính phí theo gói dịch vụ ở đó. Nó không có trên xAI API công khai, và gói miễn phí của Grok Build cũng không bao gồm nó. Bảng giá in đơn giá Fast là đầu vào 4 USD, cache 1 USD, đầu ra 12 USD dưới 200K, và đầu vào 6 USD, cache 1,50 USD, đầu ra 18 USD trên 200K. 4 USD / 1 USD / 12 USD là gấp đôi mức ngắn. 6 USD / 1,50 USD / 18 USD là 1,5 lần mức dài. Trang công bố còn nói một biến thể nhanh có tốc độ đầu ra gấp đôi với giá gấp đôi, nhưng không ghi mức 1,5 lần này. Khi tính hóa đơn, hãy dùng bảng trong tài liệu.

Trang mô hình ghi rằng Batch API không được hỗ trợ. `grok-4.7` không nằm trong danh sách chiết khấu batch của bảng giá; các mô hình có tên trong danh sách đó được chiết khấu batch 20%. Trang giá còn mô tả Priority Processing cho yêu cầu văn bản: khi phản hồi xác nhận `service_tier` là `priority`, yêu cầu được tính gấp 2 lần, sau khi đã áp chiết khấu cache. Trang mô hình Grok 4.7 không có dòng Priority riêng. Một yêu cầu có dùng hệ số đó hay không, hãy xem `service_tier` trong phản hồi.

Tài liệu tính giá riêng cho các công cụ phía máy chủ. Tìm kiếm web là 5 USD cho mỗi 1.000 lượt gọi. Tìm kiếm X tính theo từng mục lấy về: 5 USD cho mỗi 1.000 bài đăng và 10 USD cho mỗi 1.000 hồ sơ người dùng. Thực thi mã là 5 USD cho mỗi 1.000 lượt gọi. Các khoản phí này nằm ngoài giá token. Trang mô hình in ra giới hạn 150 yêu cầu mỗi giây và 50.000.000 token mỗi phút, với khu vực ghi là `us-east-1`. Hướng dẫn cũng cho biết giới hạn tốc độ và giá thực tế của từng nhóm làm việc nằm trên trang mô hình đó, nên hai con số này không phải cam kết cho mọi tài khoản.

## Đọc điểm chuẩn trên trang công bố thế nào

Trang công bố in ra một bảng so sánh. Đó không phải kết quả đo của Folkbench. Các cột là Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max và Fable 5.1 Max. Hai dòng giá là giá niêm yết đầu vào và đầu ra mà trang đó in ra. Ô DeepSWE của `grok-4.7` là 71,0%, và dấu sao ghi chú rằng ô này dùng mức high, không phải xHigh như tiêu đề cột.

| Mục | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Đầu vào / 1 triệu | 2 USD | 2 USD | 4 USD | 10 USD |
| Đầu ra / 1 triệu | 6 USD | 6 USD | 20 USD | 50 USD |
| CursorBench 4.0 | 46,3% | 40,4% | 41,7% | 51,8% |
| DeepSWE v1.1 | 71,0% (high) | 65,2% | 72,7% | 70,0% |
| EEBench | 64,0% | 53,0% | 39,4% | 56,4% |
| AA Briefcase v1.1 | 1.657 | 1.546 | 1.487 | 1.678 |
| Terminal-Bench 4.0 | 37,6% | 20,3% | 37,3% | 57,9% |
| Harvey Legal Agent Benchmark | 19,6% | 15,8% | 2,5% | 6,7% |
| HealthBench Professional | 56,7% | 48,5% | 60,5% | 62,1% |

Trang công bố cũng nói Grok 4.7 vượt Grok 4.6 trên cả GDPval lẫn AA Briefcase, và tương đương các mô hình hàng đầu khác. Biểu đồ GDPval không ghi điểm tuyệt đối trong phần văn bản, nên bài viết này không điền con số nào. Điểm AA Briefcase chính là 1.657 trong bảng trên.

Phần an toàn đưa ra hai con số. Điểm chuẩn an toàn sinh học của LatchBio là 62,4%. Trên HackerBench v0.3, 3,3% prompt lưỡng dụng có rủi ro được cho qua. Trang này nói công việc bảo mật chính đáng hiếm khi bị chặn, nhưng không đưa ra tỷ lệ từ chối với các yêu cầu chính đáng. Một số đối tác an ninh mạng được chọn có thể đăng ký quyền truy cập red team chỉ dành cho khách mời. Các con số này mô tả bài kiểm tra trên trang công bố, không phải tỷ lệ lỗi trên lưu lượng thông thường.

## Những điều cần kiểm tra trước khi chuyển lưu lượng

1. Cố định `grok-4.7`. Tên mô hình trên kết quả trả về cũng phải là ID đó. Trang danh mục dùng `grok-4-7`.
2. Mức effort mặc định là `high`. Khi so sánh, hãy ghi rõ `low`, `medium`, `high` hoặc `xhigh`.
3. Gửi `prompt_cache_key` trong các lệnh gọi nhiều lượt, hoặc `x-grok-conv-id` trên Chat Completions. Gửi lại nguyên vẹn phần reasoning đã mã hóa mà Responses trả về.
4. Tính giá riêng cho prompt dưới 200K và prompt chạm 200K. Loại thứ hai dùng đơn giá mức dài cho toàn bộ yêu cầu.
5. Endpoint khu vực Mỹ tính gấp 1,1 lần. Fast không có trên API công khai. Đừng nhân mức gấp 2 lần hay 1,5 lần vào hóa đơn API thông thường.
6. Trang mô hình ghi rằng Batch API không được hỗ trợ. Lệnh gọi công cụ cộng thêm giá theo mỗi nghìn lượt trong tài liệu.
7. Các cột đối thủ trong bảng trên trang công bố giữ nguyên giá và điểm mà trang đó in ra. Con số 71,0% của DeepSWE là mức high, không phải xHigh.
8. Một trạm trung chuyển có cung cấp ID này hay không, cùng tỷ lệ khả dụng và giá thực thu tại thời điểm đó, hãy xem danh mục đã công bố. Các bảng ở đây là giá niêm yết của xAI, không phải giá của một trạm sau khi đã nhân hệ số nhóm.

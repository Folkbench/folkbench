---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: vi
kind: article
title: "Cách đánh giá trạm trung chuyển AI cho công việc kỹ thuật phần mềm"
description: "Các bài kiểm tra về sinh mã, chuỗi công cụ của agent, ngữ cảnh dài và hành vi giao thức cache khi một trạm trung chuyển nằm trong quy trình kỹ thuật phần mềm."
category: Kỹ thuật phần mềm
tags: [kỹ thuật phần mềm, agent, sinh mã]
authorId: noah-park
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Tác giả: bài viết của ban biên tập**

Đặt một trạm trung chuyển AI (API gateway / aggregator) lên bản đồ kỹ thuật phần mềm, bản chất của nó là một proxy tầng ứng dụng (L7) có bộ phân tích dạng máy trạng thái và bộ điều phối ngữ cảnh.

Yêu cầu đặt ra đã thay đổi khi việc gợi ý từng dòng trong IDE nhường chỗ cho các agent chạy trên terminal như Claude Code CLI và OpenAI Codex CLI, và cho phương pháp phát triển hướng đặc tả (specification-driven development). Hãy tạm gác các chỉ số chung của gateway như độ ổn định mạng hay khả năng chịu tải đồng thời cao. Với việc sinh mã, câu hỏi là: proxy có làm hỏng cú pháp, làm gián đoạn máy trạng thái của agent, đánh rơi các phụ thuộc trong ngữ cảnh dài, hay gỡ bỏ giao thức tối ưu mà công cụ lập trình đã gửi đi hay không.

Bốn khía cạnh kỹ thuật sau đây trả lời câu hỏi đó.

## 1. Toàn vẹn cú pháp và ký tự thoát

Mã được sinh ra rất nhạy với ký tự và định dạng. Nó không phải văn xuôi thông thường. Nó có thụt lề, xuống dòng, ký tự thoát, và JSON hoặc XML lồng bên trong.

### 1. Thoát ký tự không thất thoát

- **Vì sao hỏng:** một khối mã trong SSE chứa `\n`, `\t`, `\"`, biểu thức chính quy `\\d` hoặc một chuỗi JSON. Nếu trạm bỏ thoát (unescape) hoặc mã hóa lại trong lúc ghép các khối, một ký tự UTF-8 nhiều byte có thể bị cắt đôi và phía client nhận được mã không phân tích được.
- **Cách kiểm tra:** yêu cầu sinh mã có ký tự thoát ở mức cực đoan: một biểu thức chính quy phức tạp, mã Python nhúng các chuỗi JSON lồng nhau, và mã C++ có con trỏ cùng macro.
- **Ngưỡng đạt:** ghi luồng dữ liệu từ trạm ra tệp rồi phân tích bằng linter trên máy (`eslint`, `flake8`) hoặc bộ phân tích AST (Babel hoặc Tree-sitter). Tỷ lệ phân tích AST thành công phải đạt 100%.

### 2. Khoảng trắng và thụt lề

- **Vì sao hỏng:** Python và YAML dùng thụt lề để xác định phạm vi. `\n` so với `\r\n` làm thay đổi Git diff.
- **Cách kiểm tra:** gửi yêu cầu tái cấu trúc một đoạn logic lồng sâu, chẳng hạn một hàm Python nằm trong 8 tầng vòng lặp.
- **Ngưỡng đạt:** dấu cách và tab trong đầu ra của trạm phải khớp với đầu ra phía thượng nguồn ở mức byte, 100%. Trạm không được tự “làm đẹp” hay nén khoảng trắng.

## 2. Gọi công cụ và đầu ra có cấu trúc

Agent lập trình không chỉ xuất Markdown. Nó gọi các công cụ như `read_file`, `edit_file` và `run_terminal_command`.

### 1. Trung thành với JSON schema

- **Vì sao hỏng:** một thao tác sửa mã trên máy là JSON có cấu trúc với các trường như `path`, `old_str` và `new_str`. Nếu trạm làm hỏng phần tuần tự hóa đó hoặc đánh rơi một trường lồng bên trong, agent sẽ phân tích thất bại và bị sập.
- **Cách kiểm tra:** chạy một tác vụ agent sửa nhiều tệp cùng lúc, ví dụ tái cấu trúc một interface trên 5 tệp TypeScript, rồi bắt lại phần thân lệnh gọi công cụ được chuyển tiếp.
- **Ngưỡng đạt:** đối tượng lệnh gọi công cụ được chuyển tiếp phải khớp với API chính thức phía thượng nguồn. Không thiếu trường, không đổi kiểu dữ liệu (chẳng hạn từ string sang number), và JSON không bị cắt sớm.

### 2. Trạng thái qua nhiều lượt

- **Vì sao hỏng:** một lỗi khó thường cần 10–30 lượt: đọc tệp, thử sửa, chạy test, đọc lỗi, sửa lại. Trạm phải chuyển tiếp `tool_use` trên `role: "assistant"` và `tool_result` trên `role: "user"` cho toàn bộ chuỗi.
- **Cách kiểm tra:** chạy một phiên gỡ lỗi bằng agent thật kéo dài hơn 10 lượt.
- **Ngưỡng đạt:** ở lượt thứ N, trạm vẫn chuyển tiếp mọi ID lệnh gọi công cụ và nút trạng thái của N−1 lượt trước. Lịch sử và trạng thái không được bị đánh rơi hay xáo trộn.

## 3. Ngữ cảnh mã dài và cache prompt

Ngữ cảnh của một codebase cỡ vừa hoặc lớn thường lên tới 100–200 nghìn token.

### 1. Chuyển tiếp nguyên vẹn cache control

- **Vì sao hỏng:** đặc tả kiến trúc và mã nền dùng chung thường cố định. Agent đánh dấu chúng bằng `cache_control` để dịch vụ mô hình tái sử dụng KV cache. Nếu trạm gỡ dấu này đi, chỉ một thao tác sửa một dòng cũng phải prefill lại hàng trăm nghìn token.
- **Cách kiểm tra:** gửi lặp lại một ngữ cảnh dự án 100 nghìn token có kèm `cache_control`.
- **Ngưỡng đạt:**
  - Ở phía yêu cầu, phần thân gửi lên thượng nguồn vẫn chứa `cache_control`.
  - Ở phía phản hồi, `usage` trả về `cache_read_input_tokens`.

### 2. Mò kim trong codebase

- **Vì sao hỏng:** để tiết kiệm chi phí, một trạm có thể cắt prompt bằng RAG, nén prompt hoặc tráo sang một mô hình nhỏ hơn, khiến tầm nhìn của mô hình về kho mã bị thu hẹp.
- **Cách kiểm tra:** trong một kho mã 150 nghìn token, giấu một định nghĩa interface ở tệp A ngay đầu và chỗ gọi nó ở tệp B tận cuối, lấp phần giữa bằng mã không liên quan, rồi hỏi cách sửa interface đó.
- **Ngưỡng đạt:** so sánh bản sửa của trạm với kết quả gọi trực tiếp API chính thức. Nếu ngữ cảnh bị cắt khiến trạm bỏ sót một biến hoặc kiểu dữ liệu liên tệp, ngữ cảnh đã bị hỏng.

## 4. Đầu ra đầy đủ và bảo vệ chỉ dẫn

Kiểu thất bại điển hình là một module 500 dòng dừng lại ở dòng 300.

### 1. Giới hạn đầu ra tối đa

- **Vì sao hỏng:** tái cấu trúc một tệp có thể cần 4 nghìn, 8 nghìn, thậm chí 16 nghìn token mã trong một phản hồi. Bộ đệm proxy nhỏ hoặc thời gian chờ ngắn sẽ cắt tệp làm đôi.
- **Cách kiểm tra:** yêu cầu một module dài không có phần độn, chẳng hạn một bộ parser với hàng trăm enum và phép chuyển đổi.
- **Ngưỡng đạt:** trạm phải truyền tải được tới mức `max_tokens` tối đa của mô hình. `finish_reason` cuối cùng phải là `"stop"` hoặc `"length"`. EOF sớm là không đạt.

### 2. Toàn vẹn system prompt

- **Vì sao hỏng:** agent lập trình đặt các quy tắc nghiêm ngặt trong system prompt, chẳng hạn chế độ strict của TypeScript hay JSDoc cho mọi hàm. Một số trạm chèn prompt toàn cục của riêng mình hoặc cắt bớt system prompt.
- **Cách kiểm tra:** gửi một system prompt có ràng buộc phong cách mã đặc trưng và yêu cầu sinh mã.
- **Ngưỡng đạt:** mã tuân thủ ràng buộc đó, và bản bắt gói tin cho thấy system prompt không bị thay đổi dù chỉ một byte.

## Bảng kiểm tra

| Khía cạnh | Nội dung kiểm tra | Ngưỡng đạt |
| --- | --- | --- |
| Ký tự và cú pháp | Ký tự thoát, thụt lề, xuống dòng | Phân tích bằng AST / linter trên máy thành công, khớp 100% |
| Chuỗi công cụ của agent | Định dạng lệnh gọi công cụ và trạng thái qua nhiều lượt | Không có lỗi phân tích JSON, chuỗi trạng thái công cụ kéo dài từ 10 lượt trở lên |
| Ngữ cảnh và cache | Chuyển tiếp cache prompt và ngữ cảnh thật | `cache_control` không bị gỡ, codebase 150 nghìn token giữ được phụ thuộc liên tệp |
| Sinh đầy đủ | Giới hạn đầu ra dài và bảo vệ system prompt | Mã liên tục từ 8 nghìn token trở lên, system prompt giữ nguyên từng byte |

---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: vi
kind: benchmark-review
title: "Đánh giá chuyên sâu GPT-6.2 Astra và Sol qua suy luận, kỹ thuật và nghiên cứu"
description: "Phân tích các bài đánh giá công khai của GPT-6.2 về suy luận trừu tượng, kỹ nghệ phần mềm, nghiên cứu học thuật và chi phí."
category: Mô hình
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 Astra và Claude Fable 5.2 cùng đạt **174 điểm** trên chỉ số năng lực của Epoch AI. Trong các nhiệm vụ mở lấy từ công việc thực tế của chính tổ chức này, Astra đạt trung bình **65%**, còn Fable 5.2 đạt **82%**. GPT-6.2 Sol tiến gần Astra trên hai bài đánh giá kỹ nghệ phần mềm, với chi phí chạy bộ tác vụ dòng lệnh chỉ khoảng một phần năm. Giải bài khó, tạo sản phẩm kiểm chứng được và tự quyết định cần tìm bằng chứng nào đòi hỏi những kỹ năng khác nhau. [Kết quả mô hình từ Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Đánh giá công việc](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI ra mắt hai mô hình vào ngày 17 tháng 11 năm 2026. Folkbench phân tích dữ liệu công khai có thể kiểm tra vào ngày 18 tháng 11. Các tổ chức đánh giá cung cấp kết quả đo, còn thông số, giá và so sánh của nhà cung cấp đến từ OpenAI. Folkbench không chạy lại các bài đánh giá. [Thông báo của OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Đánh giá và cấu hình | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, môi trường chuẩn, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Chưa đánh giá |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Trí tuệ, suy luận trừu tượng và duy trì trạng thái

Điểm **62** của Astra trên bảng Artificial Analysis cao hơn Astra đời trước **5 điểm** và thấp hơn **65** của Fable 5.2. Sol đạt **57** như Astra đời trước với khoảng **15%** chi phí mô hình bình quân có trọng số trên mỗi tác vụ của chỉ số. Epoch dùng thang khác, dựa trên mô hình Bayes của lý thuyết đáp ứng câu hỏi, có tính đến độ khó và khả năng phân biệt của từng bài đánh giá. Để dự đoán hiệu quả trong một công việc cụ thể, cần xem nhóm nhiệm vụ và điều kiện thực thi. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Phương pháp ECI](https://epoch.ai/data/eci-documentation/methodology)

ARC-AGI-2 yêu cầu suy ra quy tắc từ các lưới mẫu. Astra dẫn Sol **10.0 điểm phần trăm** ở max. Trong ARC-AGI-3 chuẩn, hệ thống phải học từ phản hồi sau các hành động và khoảng cách tăng lên **15.4 điểm**. Bản trình diễn công khai cho phép môi trường chuẩn chuyển tiếp ghi chú do mô hình chọn. Provider Adapter giữ thêm trạng thái suy luận không hiển thị và nén tương tác dài. Ở cấu hình đó, Astra và Sol đạt **99.8%** và **98.2%** tại max. Astra đạt **100.0%** ở xhigh với bộ điều hợp và **56.5%** ở cùng mức trong môi trường chuẩn. Cách lưu lại thử nghiệm và giả thuyết đã loại ảnh hưởng cả kết quả lẫn khoảng cách giữa hai mô hình. [Kết quả và môi trường của ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Kỹ nghệ phần mềm và công việc chuyên môn

Ở Terminal-Bench 4.0 với Codex ở max, chênh lệch ước tính là **0.6 điểm phần trăm**, trong khi các khoảng công bố chồng lấn đáng kể. Chi phí toàn bộ lượt chạy khoảng **1.400 USD** trên Astra và **300 USD** trên Sol. FrontierCode 2.0 gồm **132 nhiệm vụ** do người bảo trì dự án soạn, đánh giá khả năng hợp nhất thay đổi dựa trên tính đúng, kiểm thử và phạm vi. OpenAI báo cáo chênh lệch trong vòng **0.5 điểm phần trăm** ở max và chi phí Sol xấp xỉ một phần năm. Trong Coding Agent Index riêng của Artificial Analysis, Astra bằng bản trước còn Sol kém GPT-6.1 Sol **3 điểm**. Ở mục hỏi đáp kho mã SWE-Atlas-QnA-AA, Sol giảm **14 điểm** và bỏ sót nhiều dữ kiện quan trọng hơn. Đánh giá bản vá và đánh giá phần giải thích mã cần các tiêu chí riêng. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

Với Agents’ Last Exam, OpenAI báo Astra vượt Fable 5.2 **5.5 điểm** với **5%** chi phí được nêu cho Fable. Phép so sánh loại chín nhiệm vụ mà Fable dùng mô hình dự phòng. Đánh giá thủ công của Epoch đảo thứ tự với chênh lệch **17 điểm phần trăm**, dù Astra mới vượt kết quả **56%** của đời trước. Mẫu nhỏ, mỗi mô hình chạy mỗi việc một lần và môi trường tác tử khác nhau. Khi giao viết báo cáo, cần xem cách chấm có tính đến việc chọn bằng chứng, hiểu người đọc và chỉnh sửa bản đầu hay không. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Phương pháp và giới hạn của Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Kiến thức học thuật, chứng minh và thiết kế nghiên cứu

Trong so sánh ngày ra mắt, Astra chỉ xếp sau Fable 5.2 trên HLE-Diamond và tập con vật lý khó của CritPt v2. Ở AA-Omniscience mức max, tỷ lệ ảo giác của Astra và Sol là **59%** và **55%**. Tử số là câu trả lời sai, mẫu số gồm câu sai, đúng một phần và bỏ qua. Chỉ số mô tả xu hướng trả lời sai khi mô hình không đưa ra được đáp án hoàn toàn đúng. Tổng quan tài liệu cần kiểm tra từng nguồn được dẫn. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Định nghĩa AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

Theo độ chính xác hiển thị của Epoch, Astra đạt **100%** ở FrontierMath Tier 4 v2, bản trước đạt **98%**. Ở FrontierMath Erdős, kết quả là **10%** và **3%**. Bộ thứ hai gồm 68 vấn đề còn mở khi xây dựng, với chứng minh hoặc phản chứng được kiểm bằng Lean. Việc kiểm chứng xác lập kết quả cho mệnh đề hình thức. Giá trị học thuật còn phụ thuộc mệnh đề có phản ánh đúng câu hỏi gốc và kết quả có đóng góp mới hay không. [Kết quả toán học của Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

Trong 70 nhiệm vụ có đầu ra kiểm chứng được của Terminal-Bench-Science 0.1, Astra đạt **78.6%** ở xhigh và **78.1%** ở max. Khi Epoch yêu cầu thiết kế một biến thể cờ vua có luật lạ, Astra chủ yếu đổi nhãn quân cờ và giữ luật tương đương. Thiết kế này khó phân biệt khả năng khái quát với kiến thức cờ vua sẵn có. Epoch cũng ghi nhận ít thay đổi sau lần thử đầu tiên. Thẻ hệ thống của OpenAI xếp Astra vào ngưỡng High về khả năng tự cải thiện AI, còn Sol thấp hơn. Phân loại này áp dụng cho môi trường nghiên cứu AI cụ thể. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Trường hợp nghiên cứu của Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Thẻ hệ thống OpenAI](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Chi phí trên mỗi kết quả được nghiệm thu

Cả hai API có cửa sổ **1.050.000 token**, tối đa **922.000** đầu vào và **128.000** đầu ra. Giá chuẩn ngữ cảnh ngắn theo triệu token cho đầu vào chưa lưu đệm, đọc bộ nhớ đệm và đầu ra lần lượt là **8 / 0.40 / 40 USD** cho Astra và **2 / 0.10 / 10 USD** cho Sol. Trên **272K** token đầu vào, giá đầu vào và bộ nhớ đệm tăng gấp đôi, giá đầu ra tăng **1.5 lần** cho toàn bộ yêu cầu. Một lượt ngắn gồm 100.000 token đầu vào chưa lưu đệm và 10.000 token đầu ra tính phí có giá **1.20 USD** trên Astra và **0.30 USD** trên Sol trước phí công cụ và ghi bộ nhớ đệm. Với tỷ lệ chi phí cố định 1:4, thử Sol trước và dùng Astra thêm một lần khi thất bại sẽ rẻ hơn nếu tỷ lệ chuyển dưới **75%**. Cũng cần cân nhắc tỷ lệ nghiệm thu, độ trễ và công sức rà soát. Sol đáng thử trước trong công việc có tiêu chí rõ, còn Astra có bằng chứng mạnh hơn cho suy luận hình thức khó và tìm quy tắc mới. Trong nghiên cứu mở, cả hai đều cần kiểm tra trích dẫn và thiết kế thực nghiệm. [API Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [API Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)

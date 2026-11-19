---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: vi
kind: benchmark-review
title: "Phân tích chuyên sâu dòng Gemini 4: cách Argon, Carbon, Hydrogen và Neon tư duy"
description: "Đối chiếu thẻ mô hình của Google với kết quả từ Artificial Analysis, Epoch AI, ARC Prize và Terminal-Bench để phân tích bốn mô hình Gemini 4 về trí tuệ tổng quát, suy luận trừu tượng, toán học và khoa học, kỹ thuật phần mềm, ngữ cảnh dài và an toàn, đồng thời cho thấy ngân sách suy luận và điều kiện đánh giá làm thay đổi kết luận như thế nào."
category: Mô hình
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

Trên Intelligence Index v5.0.1 của Artificial Analysis, nếu giới hạn số token đầu ra dùng để chạy toàn bộ chỉ số trong khoảng 110 đến 124 triệu, các mô hình Gemini 4 xếp theo thứ tự: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58** và Neon (high) **60**. Cả bốn có cùng mốc dữ liệu tri thức là tháng 3/2026. Theo thẻ mô hình của Google, Carbon được xây dựng trên Argon, còn Hydrogen và Neon được điều chỉnh từ Carbon. Trong môi trường chuẩn của ARC‑AGI‑3, ở cùng mức low, Carbon cao hơn Argon **15,3 điểm phần trăm**; trên FrontierMath Tier 4, Epoch AI ghi nhận khoảng cách **17 điểm**. Bảy tuần, bốn lần phát hành, cùng một mốc tri thức: dòng Gemini 4 gần như là một thí nghiệm công khai về hậu huấn luyện và ngân sách suy luận. Nó cũng nhắc rằng so sánh với cùng ngân sách và so sánh với cùng tên mức cài đặt sẽ cho ra hai bảng xếp hạng khác nhau. [Đánh giá ra mắt Neon của Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Kết quả xác minh Carbon của ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Dữ liệu Carbon trên Epoch](https://epoch.ai/models/gemini-4-carbon)

Google công bố Argon ngày 30/9 và Carbon ngày 28/10; Carbon mở cho mọi người từ ngày 10/11, sau đó Hydrogen ra mắt ngày 12/11 và Neon ngày 18/11. Bài viết dựa trên các kết quả công khai có thể tra cứu vào ngày 19/11 và là phân tích thứ cấp của Folkbench. Điểm số trong thẻ mô hình và bài công bố do Google báo cáo; trong các bảng đó, một số điểm của mô hình đối chứng do Google tự chạy, số khác được ghi là do bên thứ ba chạy. Kết quả của Artificial Analysis, Epoch AI, ARC Prize và Terminal-Bench thuộc về từng đơn vị đánh giá. Folkbench không chạy lại mô hình nào cho bài viết này. Tỷ lệ phần trăm theo định nghĩa của từng bảng xếp hạng, và mọi kết luận phụ thuộc vào mức suy luận, môi trường thực thi hoặc bên chạy đánh giá chỉ đúng trong điều kiện đó. [Bài công bố Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon đã sẵn sàng](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Bài công bố Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Một nền tảng, bốn vòng hậu huấn luyện

| Mô hình | Công bố | Định vị chính thức | Nguồn gốc theo thẻ mô hình | Giá API (đầu vào / đầu ra cho 1 triệu token) | AA Index v5.0.1 cao nhất |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30/9 | Lập trình, công việc tri thức doanh nghiệp, phòng thủ an ninh mạng | Mô hình MoE thưa được huấn luyện mới | 2 / 10 USD giá ưu đãi, sau đó 4 / 20 USD | 50 (high) |
| Gemini 4 Carbon | 28/10, mở rộng rãi từ 10/11 | Tác vụ dài hạn và an ninh mạng | Dựa trên Argon | 2 / 10 USD đến 30/11, sau đó 4 / 20 USD | 60 (high) |
| Gemini 4 Hydrogen | 12/11 | Xử lý nhanh công việc hằng ngày | Điều chỉnh từ Carbon | 1,50 / 7,50 USD | 54 (xhigh) |
| Gemini 4 Neon | 18/11 | Cân bằng giữa chiều sâu và hiệu quả | Điều chỉnh từ Carbon | 3 / 15 USD | 61 (xhigh) |

[Thẻ mô hình Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Thẻ mô hình Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Thẻ mô hình Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Thẻ mô hình Argon chứa phần mô tả kiến trúc duy nhất của thế hệ này: một Transformer hỗn hợp chuyên gia (MoE) thưa quy mô lớn, hỗ trợ nguyên bản đầu vào văn bản, hình ảnh và âm thanh, được huấn luyện như một mô hình mới chứ không phải tinh chỉnh từ mô hình cũ. Mô hình được huấn luyện trên TPU với JAX và ML Pathways; giai đoạn hậu huấn luyện gồm tinh chỉnh theo chỉ dẫn, dữ liệu ưu tiên của con người và học tăng cường với dữ liệu suy luận nhiều bước, giải quyết vấn đề và chứng minh định lý. Thẻ của Carbon dẫn ngược về Argon cho kiến trúc, dữ liệu và phần cứng. Thẻ của Hydrogen và Neon ghi rằng cả hai được điều chỉnh từ Carbon (adapted from) và lại dẫn về Carbon. Cả bốn hỗ trợ ngữ cảnh tối đa 1 triệu token cho đầu vào và đầu ra cộng lại. [Thẻ mô hình Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Cấu trúc này quyết định cách đọc tiến bộ trong cùng dòng mô hình. Vì mốc tri thức không đổi, mức tăng từ Argon lên Carbon không thể đến từ kiến thức mới về thế giới; nhiều khả năng nó đến từ thay đổi trong dữ liệu hậu huấn luyện, học tăng cường và cấu hình suy luận. Google không công bố số tham số, cũng không giải thích "điều chỉnh" là chưng cất, huấn luyện tiếp hay phương pháp khác, nên không thể suy ra quy mô và lộ trình huấn luyện của Hydrogen và Neon từ tài liệu công khai. Điều rõ ràng là phần lớn khác biệt năng lực trong thế hệ này xuất hiện sau giai đoạn tiền huấn luyện.

## Trí tuệ: cùng tên mức cài đặt không có nghĩa là cùng ngân sách suy luận

Khi công bố ngày 28/10, Carbon dẫn đầu chỉ số v5.0 với **59** điểm. Ba tuần sau, lần chấm lại v5.0.1 cho Carbon **60**, nhưng vị trí số một đã thuộc về Claude Fable 5.2 với **65**, tiếp theo là GPT‑6.2 Astra với **62** và Neon với **61**; Claude Opus 5.5 đạt **59** và GPT‑6.2 Sol **57**. ECI của Epoch AI xếp Carbon ở vị trí tương tự: **170**, hạng ba trong 241 mô hình được theo dõi, so với Argon **167**, Fable 5.2 **174** và GPT‑6 Astra **169**. Hai chỉ số dùng phương pháp khác nhau nhưng đều đặt Carbon vào nhóm dẫn đầu, chỉ thấp hơn một chút so với những mô hình đứng đầu hiện nay. Tính đến ngày 19/11, Epoch chưa công bố dữ liệu về Neon; Hydrogen đã có kết quả từng bài nhưng chưa có ECI. Xếp hạng tổng hợp thay đổi theo từng tuần, nên một lần "đứng đầu" không có nhiều sức nặng. [Bài công bố Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Đánh giá ra mắt GPT‑6.2 của Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Dữ liệu Carbon trên Epoch](https://epoch.ai/models/gemini-4-carbon)

Đường cong theo từng mức suy luận cho nhiều thông tin hơn. Số trong ngoặc là token đầu ra dùng để chạy toàn bộ chỉ số.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3 triệu) | 27 (20,3 triệu) | 54 (83,9 triệu) | không công bố |
| medium | 55 (62,9 triệu) | 41 (54,4 triệu) | 58 (124 triệu) | 48 (81,7 triệu) |
| high (mặc định) | 60 (123 triệu) | 51 (110 triệu) | 60 (205 triệu) | 50 (113 triệu) |
| xhigh | 61 (283 triệu) | 54 (304 triệu) | không có | không có |

[Neon theo mức](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen theo mức](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon theo mức](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon theo mức](https://artificialanalysis.ai/models/gemini-4-argon)

Thứ nhất, lợi ích cận biên giảm rất nhanh. Nâng Neon từ high lên xhigh làm token đầu ra tăng **2,3 lần** để đổi lấy **1** điểm, và thời gian mỗi tác vụ tăng từ 14,8 lên 21,5 phút; cùng bước đó, Hydrogen tốn **2,8 lần** token để được **3** điểm. Thứ hai, tên mức cài đặt không phải đơn vị ngân sách. Mức low của Carbon dùng 83,9 triệu token, nhiều hơn mức medium của Neon. Với tổng ngân sách tương đương, thứ tự là Argon 50, Hydrogen 51, Carbon 58, Neon 60, và điều này nói lên tác động của hậu huấn luyện rõ hơn việc so sánh mọi mô hình ở mức mặc định. Cách so sánh này cũng có giới hạn: số token là tổng của cả chỉ số, không ghép theo từng tác vụ, và tốc độ đầu ra khác nhau. Neon ở mức high tạo khoảng 101 token mỗi giây, Carbon từ 55 đến 58, nên cùng lượng token sẽ đồng nghĩa với thời gian chờ khác nhau.

Thứ ba, mô hình nhỏ nhạy với ngân sách hơn. Từ low đến high, Hydrogen tăng **24 điểm**, Neon **16 điểm**, còn Carbon chỉ **6 điểm**. Với một mô hình nhanh như Hydrogen, chọn sai mức có thể thiệt hại nhiều hơn cả việc đổi sang mô hình khác.

## Suy luận trừu tượng: trên ARC‑AGI‑3, nghĩ lâu hơn chưa chắc đã tốt hơn

| Kết quả xác minh của ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1% / 87,1% / 91,3% | 49,6% / 94,2% / 92,1% |
| ARC‑AGI‑3 môi trường chuẩn, low / medium | 49,8% / 46,3% | 65,1% / 63,9% |
| ARC‑AGI‑3 môi trường chuẩn, high | không tính điểm (hoàn thành 19/55 ván) | không tính điểm (hoàn thành 30/55 ván) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97,5% / 97,3% / 97,3% | 97,7% / 99,1% / 96,9% |

[Kết quả xác minh Argon của ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Kết quả xác minh Carbon của ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Có ba điểm đáng chú ý. Thứ nhất, điểm số không tăng đơn điệu theo mức suy luận: trên ARC‑AGI‑2, Carbon ở medium cao hơn high; trong môi trường chuẩn ARC‑AGI‑3, low cao hơn medium, và kết quả tốt nhất của Argon trên ARC‑AGI‑3 cũng ở low. Thứ hai, mức cao nhất có thể thất bại hoàn toàn trong môi trường tương tác. Ở mức high, Carbon để khoảng cách giữa hai hành động quá dài khiến phiên chơi hết hạn, và chỉ hoàn thành 30 ván; Argon ở mức high chỉ hoàn thành 19 ván do sự cố API. Với câu hỏi tĩnh, nghĩ lâu hơn chỉ tốn thêm tiền; trong môi trường tương tác, nó còn tiêu tốn thời gian của môi trường. Thứ ba, khoảng cách giữa các môi trường thực thi lớn hơn nhiều so với khoảng cách giữa các thế hệ. Carbon đạt **99,1%** với Provider Adapter nhưng cao nhất chỉ **65,1%** trong môi trường chuẩn, chênh khoảng **34 điểm**. Theo ARC Prize, môi trường chuẩn chỉ cho mô hình mang theo những ghi chú mà nó tự chọn giữ lại, còn Provider Adapter lưu trạng thái suy luận không minh bạch giữa các yêu cầu và nén các cuộc hội thoại dài.

Xét theo từng trò chơi, điểm bị mất tập trung ở một vài trò. Trong môi trường chuẩn, G50T đạt **0,0%** với cả Argon lẫn Carbon ở low và medium, BP35 không quá **1,0%** và TU93 không quá **5,3%**; với Provider Adapter, ba trò này phần lớn đạt 100%. Tổng điểm tăng 15 điểm nhưng các trò này gần như không nhúc nhích. Một cách giải thích hợp lý nhưng chưa được kiểm chứng là chúng mắc ở việc duy trì trạng thái qua nhiều bước chứ không phải suy luận trong một bước, và mức tăng giữa các thế hệ chủ yếu đến từ những môi trường vốn đã giải được một phần. Để tham chiếu, GPT‑6.2 Astra đạt **70,3%** trong môi trường chuẩn ở mức max và GPT‑6.2 Sol đạt **54,9%**; Carbon nằm ở giữa. [Kết quả xác minh GPT‑6.2 của ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Năng lực học thuật: hiệu chỉnh tri thức, toán học và thực thi khoa học

| Kết quả của Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | chưa kiểm tra | 3% | chưa kiểm tra |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Dữ liệu Carbon trên Epoch](https://epoch.ai/models/gemini-4-carbon) · [Dữ liệu Hydrogen trên Epoch](https://epoch.ai/models/gemini-4-hydrogen)

**Tri thức và hiệu chỉnh.** GPQA Diamond không còn phân biệt được các mô hình hàng đầu: cả năm mô hình trong bảng đều nằm trong khoảng 96% đến 97%. Điều phân biệt rõ hơn là khả năng nhớ dữ kiện và cách mô hình xử lý khi không biết. Trên SimpleQA Verified của Epoch, Carbon đạt **78%**, thấp hơn Fable 5.2 **16 điểm**. Ngược lại, trên AA‑Omniscience v1.1 của Artificial Analysis, Carbon (medium) và Argon (high) đều có tỷ lệ ảo giác **4%**, và Carbon thấp nhất bảng. Mẫu số của chỉ số này là mọi câu trả lời không hoàn toàn đúng, còn tử số là những câu trả lời sai rõ ràng; để so sánh, GPT‑6.2 Astra và Sol ở mức max lần lượt là **59%** và **55%**. Hai kết quả đến từ các bộ câu hỏi khác nhau nên không thể gộp lại, nhưng cùng chung một hướng: Gemini 4 chưa chắc nhớ nhiều nhất, song khi không biết, nó thường từ chối trả lời hoặc chỉ trả lời một phần thay vì bịa ra. Ít nhất với loại câu hỏi tri thức này, các câu trả lời khẳng định của nó ít sai hơn; khi dùng để tổng quan tài liệu, độ bao phủ vẫn phải dựa vào tìm kiếm. [Định nghĩa và bảng xếp hạng AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond là một trong bốn bài đánh giá của chỉ số v5.0 mà Carbon đứng đầu. Google báo cáo Neon **71,3%**, Opus 5.5 **67,9%**, GPT‑6.2 Sol **64,0%** và Hydrogen **58,8%**; tất cả các số này đều lấy từ thẻ mô hình của Google. [Tóm tắt kết quả v5.0 của DeepLearning.AI](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Toán học.** Từ Argon lên Carbon, FrontierMath Tier 4 tăng **17 điểm**, bước nhảy giữa các thế hệ lớn nhất trong bộ dữ liệu này, đưa Carbon đến gần GPT‑6 Astra và Fable 5.2. Thế nhưng FrontierMath Erdős chỉ tăng từ **1%** lên **3%**. 68 bài toán của nó vẫn còn mở khi bộ đánh giá được xây dựng, và các chứng minh hoặc phản chứng được kiểm tra bằng Lean; kết quả cao nhất hiện nay là **10%** của GPT‑6.2 Astra. Các bài toán cấp nghiên cứu đã có đáp án đang dần bão hòa, trong khi các bài toán mở gần như chưa được chạm tới. RiemannBench do Google tự báo cáo tăng từ Argon **76,0%** và Carbon **80,0%** lên Neon **84,0%**, cùng hướng nhưng do chính nhà cung cấp đo. Các bài đánh giá câu đố của Epoch cũng cho thấy mức tăng nhờ hậu huấn luyện tương tự: câu đố cờ vua tăng từ 59% lên 78%, EBR‑bench từ 65% lên 88%. Đây đều là tác vụ đòi hỏi tìm kiếm nhiều bước dưới ràng buộc luật chơi, khớp với mức tăng trong môi trường chuẩn ARC‑AGI‑3. Mô hình nhanh Hydrogen đạt **88%** ở Tier 4, cao hơn Argon **10 điểm**, nhưng điểm câu đố gần với Argon và khả năng nhớ trên SimpleQA Verified chỉ đạt **71%**. Một cách giải thích khả dĩ là những năng lực có đáp án kiểm tra tự động được, như toán học, được giữ lại tốt hơn khi điều chỉnh mô hình thành phiên bản nhanh, còn tri thức ghi nhớ phụ thuộc nhiều hơn vào dung lượng mô hình; tài liệu công khai chưa đủ để xác nhận điều này. [Phương pháp của FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Thực thi khoa học.** Terminal‑Bench‑Science 0.1 yêu cầu mô hình bàn giao trong terminal các sản phẩm nghiên cứu có thể kiểm tra bằng bài test. Trong thẻ mô hình Carbon, với các lần chạy của Artificial Analysis, Carbon đạt **64,8%**, Argon **52,9%**, GPT‑6 Astra **63,3%** và Opus 5.5 **59,0%**. Thẻ mô hình Neon báo cáo Neon đạt **70,5%**, cao hơn GPT‑6.2 Sol (**68,0%**) và Opus 5.5 (**63,3%**). Google gọi Neon là tốt nhất trong phân khúc, điều này đúng trong nhóm đối chứng mà hãng chọn; trên bảng xếp hạng đầy đủ của Artificial Analysis, GPT‑6.2 Astra ở mức xhigh đạt **78,6%**, vẫn cao hơn **8,1 điểm**. Hydrogen đạt **51,4%**, thấp hơn mô hình đối chứng của nó là Claude Sonnet 5.5 (**59,9%**). [Bảng xếp hạng Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Thẻ mô hình Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Kỹ thuật và tác tử: môi trường thực thi quyết định một nửa câu trả lời

Trên bảng xếp hạng chính thức của Terminal‑Bench 4.1, Carbon (high, Antigravity CLI) đạt **64,5% ± 3,2%** với chi phí khoảng **1.400 USD** cho một lượt chạy đầy đủ; Claude Opus 5.5 và Fable 5.2 cùng đạt **65,8%**, GPT‑6.2 Astra đạt **62,1%**. Khoảng cách giữa Carbon và vị trí dẫn đầu nằm trong khoảng tin cậy. Thú vị hơn là so sánh nội bộ: Hydrogen đạt **56,4% ± 3,0%** với khoảng **800 USD**, Argon đạt **55,5% ± 2,8%** với khoảng **1.100 USD**, nghĩa là mô hình nhanh đã bắt kịp mô hình chủ lực của sáu tuần trước với khoảng ba phần tư chi phí. Con số **65,2%** của Neon lấy từ thẻ mô hình của Google và tính đến ngày 19/11 vẫn chưa xuất hiện trên bảng xếp hạng chính thức. [Bảng xếp hạng Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Khi so sánh giữa các thẻ mô hình, trước hết cần xem ai là bên chạy đánh giá. Dòng Terminal‑bench 4.0 trong thẻ Argon cho Argon **57,4%** và Opus 5.5 **66,4%**; hai tuần sau, thẻ Carbon chuyển sang Terminal‑Bench 4.0 do Artificial Analysis chạy và cho Argon **57,1%**, Opus 5.5 **59,6%**. Cùng một mô hình đối chứng lệch nhau **6,8 điểm** trên một bộ đánh giá cùng tên, trong khi điểm của chính Argon gần như không đổi. Nếu dùng con số 66,4% của Opus trong thẻ Argon, 65,2% của Carbon không còn dẫn đầu, và trên bảng xếp hạng chính thức 4.1 Carbon cũng thấp hơn Opus một chút. Terminal‑Bench‑Science cho thấy hiện tượng tương tự: GPT‑6 Astra đạt **68,1%** trong thẻ Argon và **63,3%** theo số liệu AA trong thẻ Carbon. [Thẻ mô hình Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Thẻ mô hình Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (thẻ mô hình Neon) | Môi trường trung lập mini‑SWE | Môi trường riêng của từng nhà cung cấp |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8% | 39,0% |
| Claude Opus 5.5 | 3,6% | 10,1% |
| GPT‑6.2 Sol | 11,6% | 8,3% |

Trong môi trường trung lập mini‑SWE, Neon chỉ hơn GPT‑6.2 Sol **1,2 điểm**; khi chuyển sang môi trường riêng của từng hãng, khoảng cách nới rộng lên **30,7 điểm**. Trong Antigravity, điểm của Neon khoảng gấp ba điểm mini‑SWE, Opus 5.5 tăng khoảng 2,8 lần trong môi trường của chính mình, còn Sol thậm chí giảm. Môi trường của nhà cung cấp là một phần của sản phẩm, nên các con số này đo tổ hợp "mô hình cộng chuỗi công cụ" chứ không phải riêng mô hình. Dòng SWE‑sweep trong thẻ Carbon chỉ có một cột và không ghi môi trường (Carbon **9,6%**, Argon **4,3%**). Con số 3,6% của Opus 5.5 trong đó trùng với giá trị mini‑SWE ở thẻ Neon, gợi ý cùng một cấu hình; nếu đúng vậy, dòng mô hình này đi từ 4,3% lên 9,6% rồi 12,8% trên mini‑SWE. [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Các bài đánh giá lập trình khác cho bức tranh dè dặt hơn. Trên FrontierSWE 2, Carbon đạt **61,2%**, thấp hơn GPT‑6 Astra (**65,5%**) và Opus 5.5 (**62,3%**); trên FrontierCode 2.0, Neon đạt **46,2%**, thấp hơn Opus 5.5 (**47,3%**) một chút. Trên Coding Agent Index của Artificial Analysis, Neon (xhigh, Antigravity CLI) dẫn đầu với **59**, còn Fable 5.2 (xhigh) và Opus 5.5 (max) cùng đạt **58**, với chi phí trung bình mỗi tác vụ lần lượt **6,86**, **15,47** và **12,61 USD**; lợi thế của Neon chủ yếu nằm ở chi phí. Thao tác máy tính là điểm yếu nhất quán của cả dòng: trên tập con ngoại tuyến của OSWorld‑2.1, Carbon với **81,5%** xếp sau Opus 5.5 (**87,2%**), và Hydrogen với **77,6%** xếp sau Claude Sonnet 5.5 (**83,9%**). [Đánh giá ra mắt Neon của Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Thẻ mô hình Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

Ở mảng công việc tri thức, AutomationBench của Zapier tăng từ Argon **51,3%** và Carbon **53,9%** lên Neon **56,3%**, còn số dư của doanh nghiệp mô phỏng trong Vending‑Bench 2 tăng từ **13.718 USD** lên **16.843 USD**. Argon đạt **19,6%** trên bộ đánh giá tác tử pháp lý của Harvey, trong khi không mô hình đối chứng nào vượt **6,7%**; mức dẫn trước lớn, nhưng giá trị tuyệt đối cho thấy các tác vụ pháp lý này vẫn còn xa mới đạt mức có thể bàn giao. Cũng cần để ý tên gọi: AutomationBench‑AA trong thẻ Hydrogen (**76,1%**) là phiên bản của Artificial Analysis và không thể so trực tiếp với phiên bản của Zapier.

## Ngữ cảnh dài và đa phương thức: dẫn trước ở tác vụ tổng hợp, tài liệu thật cần kiểm tra riêng

GraphWalks (từ 256K đến 1 triệu token, duyệt theo chiều rộng, F1) theo báo cáo của Google là hạng mục dòng mô hình dẫn trước xa nhất: Argon **84,2%**, Carbon **96,2%** và Neon **95,2%**, so với Opus 5.5 **66,8%**, GPT‑6 Astra **71,8%** và GPT‑6.2 Sol **80,1%**; trong phạm vi 128K, Argon đã đạt **99,7%**. GraphWalks rải các cạnh của một đồ thị khắp đầu vào dài và yêu cầu mô hình lần theo chúng, qua đó đo khả năng định vị và nối các thông tin nằm cách xa nhau. Mức dẫn trước này cho thấy khả năng truy xuất và liên kết rất mạnh trên đầu vào cực dài, nhưng một tác vụ đồ thị tổng hợp không có xung đột ngữ nghĩa, phiên bản tài liệu hay tiền đề ngầm; khi dùng để rà soát hợp đồng hoặc tổng hợp nhiều bài báo, vẫn cần kiểm tra bằng tài liệu của chính bạn. Đây là kết quả Google tự đo và chưa có bên thứ ba tái lập. Neon và Hydrogen mặc định xuất đồng bộ tối đa 64K token, và tối đa 1 triệu token qua giải mã dài chạy nền. [Thẻ mô hình Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Ở đa phương thức có một điểm thụt lùi. Trên LVBench về hiểu video dài, Argon đạt **91,7%**, còn Neon được điều chỉnh từ Carbon đạt **89,0%**: vẫn cao hơn Opus 5.5 (**83,7%**) và GPT‑6.2 Sol (**87,6%**), nhưng thấp hơn chính thế hệ trước **2,7 điểm**. Trên Chartography về hiểu biểu đồ, Neon với **73,5%** thấp hơn Sol (**75,1%**). Bài đánh giá suy luận thị giác GDP.pdf của Artificial Analysis một lần nữa không đơn điệu theo mức suy luận: Neon đạt **33,4%** ở high nhưng giảm xuống **28,0%** ở xhigh, còn Carbon ở high đạt **28,4%**. [Đánh giá ra mắt Neon của Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## An toàn và căn chỉnh: năng lực an ninh mạng càng mạnh, phát hành càng theo từng giai đoạn

An ninh mạng là năng lực Google nhấn mạnh nhất và cũng là lý do phát hành theo từng giai đoạn. Trên SEC‑bench Pro về phát hiện lỗ hổng, điểm tăng từ Argon **83,4%** và Carbon **88,2%** lên Neon **90,5%**; trên ExploitGym về khai thác lỗ hổng, Carbon đạt **54,8%** so với Argon **42,0%**. Argon và Carbon đều được cung cấp trước cho những người phòng thủ an ninh mạng đáng tin cậy qua chương trình Fairwind, và Google còn cung cấp cho họ cùng các nhóm nội bộ phiên bản không có rào chắn an ninh mạng. [Bài công bố Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Bài công bố Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Thẻ mô hình Argon đưa ra các xác định theo Frontier Safety Framework phiên bản tháng 4/2026: không thể loại trừ Critical Capability Level (CCL) cấp 1 về sinh học và an ninh mạng, nên Google đã xây dựng lập luận an toàn và đánh giá mô hình ở dưới CCL khi có biện pháp bảo vệ; các lĩnh vực hóa học, phóng xạ và hạt nhân chưa đạt ngưỡng theo dõi, còn cả việc tăng tốc lẫn tự động hóa nghiên cứu phát triển học máy đều chưa đạt CCL. Sau các bài kiểm tra có mục tiêu, Hydrogen chưa đạt CCL về CBRN lẫn an ninh mạng, nhưng đã chạm ngưỡng cảnh báo ở cả hai. Thẻ mô hình Neon cho biết mức tăng năng lực tổng quát so với Argon thấp hơn ngưỡng "thay đổi năng lực đáng kể", nên không đánh giá lại toàn bộ năng lực trọng yếu mà giữ nguyên các xác định của Argon. Đáng chú ý là Neon cao hơn Argon **11 điểm** trên chỉ số của Artificial Analysis; cách Google đặt ngưỡng này không thể kiểm chứng từ tài liệu công khai. [Thẻ mô hình Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Thẻ mô hình Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Thẻ mô hình Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Về hành vi, Carbon và Neon có tỷ lệ gian lận thành công **0,0%** trên Terminal‑Bench 4.0 và tỷ lệ tấn công thành công **0,0%** trong bài kiểm tra tiêm prompt gián tiếp của Gray Swan (Neon ở mức suy luận cao nhất), so với **0,7%** của Argon. Trong đánh giá tính trung thực của tác tử do Google thực hiện, Carbon vượt qua **92%** tác vụ, Argon **70%**; Neon và Hydrogen báo cáo lần lượt **99,2%** và **94%**, nhưng các bài công bố không nói rõ có cùng bộ tác vụ hay không. Thẻ mô hình Hydrogen cũng công khai cái giá phải trả: so với Gemini 3.8 Flash, tỷ lệ từ chối không chính đáng tăng **5,57 điểm**, rõ nhất với prompt đa phương thức. [Google: Carbon đã sẵn sàng](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Bài công bố Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Bài công bố Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Chi phí và lựa chọn: tính giá theo tác vụ đã qua nghiệm thu

Hydrogen có giá **1,50 USD** cho mỗi triệu token đầu vào và **7,50 USD** cho mỗi triệu token đầu ra, áp dụng đồng giá trên toàn cửa sổ 1 triệu token; Neon là **3 / 15 USD**, đầu vào lưu đệm **0,15 USD**; giá ưu đãi **2 / 10 USD** của Carbon kéo dài đến 30/11, sau đó là **4 / 20 USD**. Đầu vào lưu đệm của Argon, Carbon và Neon đều bằng 5% giá đầu vào. Theo chi phí mỗi tác vụ của Artificial Analysis, Hydrogen ở xhigh đạt 54 điểm với **3,16 USD**, Argon ở high đạt 50 với **4,97 USD** (theo giá ưu đãi), Neon ở xhigh đạt 61 với **6,44 USD** và Carbon ở high đạt 60 với **7,76 USD** (theo giá chuẩn). Neon ở high đạt cùng 60 điểm như Carbon ở high với chi phí mỗi tác vụ chưa bằng một nửa. [Bài công bố Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Đánh giá ra mắt Neon của Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Một ví dụ có thể tự tính lại: một yêu cầu gồm 100.000 token đầu vào không lưu đệm và 10.000 token đầu ra, không tính phí công cụ, tốn **0,225 USD** với Hydrogen, **0,45 USD** với Neon, và **0,30 USD** với Carbon trong giai đoạn ưu đãi hoặc **0,60 USD** khi trở về giá chuẩn. Giả sử định tuyến chạy Hydrogen trước và chuyển các trường hợp thất bại sang Neon. Với tỷ lệ chi phí mỗi lần gọi cố định 1:2, chi phí thuần cho mô hình vẫn thấp hơn dùng Neon trực tiếp miễn là dưới **50%** tác vụ phải chuyển lên; theo chi phí mỗi tác vụ ở xhigh của Artificial Analysis (3,16 so với 6,44 USD), điểm hòa vốn vào khoảng **51%**. So sánh thực tế còn phải tính cả số lần thử lại, độ trễ và tỷ lệ đạt cuối cùng. Ví dụ này chỉ minh họa cấu trúc chi phí; các con số không phải số đo của Folkbench.

Với tác vụ hàng loạt có thể nghiệm thu tự động, Hydrogen là mô hình nên thử trước: nó ngang bằng hoặc vượt Argon cả trên chỉ số AA lẫn Terminal‑Bench với giá thấp hơn. Với lập trình và công việc tri thức hằng ngày, Neon ngang bằng hoặc nhỉnh hơn Carbon ở phần lớn các bài đánh giá có mặt trong cả hai thẻ mô hình (thấp hơn một chút ở Agents' Last Exam và GraphWalks), và từ sau ngày 30/11 đơn giá của nó cũng thấp hơn Carbon. Carbon vẫn là mô hình có nhiều bằng chứng nhất cho kỹ thuật dài hạn, an ninh mạng và các tác vụ tương tác như ARC‑AGI‑3. Dù chọn mô hình nào, hãy đo các mức suy luận trên chính tác vụ của bạn: trên ARC‑AGI và GDP.pdf, mức cao nhất không phải lúc nào cũng tốt nhất.

Giá trị của Gemini 4 lúc ra mắt không nằm ở một vị trí dẫn đầu riêng lẻ. Trong bảy tuần và trên cùng một mốc tri thức, dòng mô hình này cho thấy hậu huấn luyện và cấu hình suy luận có thể đẩy năng lực đi xa đến đâu: tăng 11 điểm trên chỉ số AA, 15 điểm trong môi trường chuẩn ARC‑AGI‑3 và 17 điểm trên FrontierMath Tier 4. Nó cũng chỉ ra những chỗ hướng đi này chưa xoay chuyển được: các bài toán mở vẫn dừng ở mức một chữ số phần trăm, thao tác máy tính còn kém Claude, và một số trò ARC‑AGI‑3 trong môi trường chuẩn vẫn ở mức 0 điểm. Thẻ mô hình của nhà cung cấp tự chọn đối chứng và bên chạy thử nghiệm, còn các bảng xếp hạng độc lập liên tục chấm lại và đổi phiên bản. Những điểm số này có mang lại kết quả thực hay không, rốt cuộc phụ thuộc vào cách tác vụ của chính bạn được nghiệm thu.

---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "vi"
kind: article
title: "Đổi con số, suy luận còn đúng không? Đánh giá độ vững toán học"
description: "Đọc GSM-Symbolic thận trọng qua biến thể có kiểm soát, thống kê ghép cặp, điều kiện máy tính và giới hạn kết luận năng lực."
category: "Phương pháp đánh giá"
tags: [toán học, suy luận, đánh giá]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh và cộng sự, GSM-Symbolic，bản sửa đổi 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi và cộng sự, Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo và cộng sự, A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer và cộng sự, FrontierMath，bản sửa đổi 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean và cộng sự, Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Một đáp án đúng cho biết một đầu ra khớp kết quả mong đợi. Nếu đổi tên, điều chỉnh số hoặc thêm câu không liên quan khiến hiệu năng bất ổn, cần xác định lỗi xảy ra ở đâu. Đánh giá toán học cần điều kiện kiểm soát và chẩn đoán, không chỉ bài khó hơn.

Nguồn được kiểm tra ngày 2026-11-14. Bài viết trình bày phương pháp và thiết kế đề xuất. Folkbench không chạy mô hình; các câu và số dưới đây là minh họa, không phải điểm đo.

## Năng lực toán học gồm nhiều bước

Giải bài có lời văn đòi hỏi nhận diện đại lượng và đơn vị, hiểu quan hệ, lập biểu thức, tính toán và đáp đúng định dạng. Lỗi ở bất kỳ bước nào có thể nhận cùng điểm không. Độ chính xác cuối đo sản phẩm, nhưng không tự giải thích cơ chế lỗi.

Biểu thức đúng nhưng nhân sai khác với quan hệ sai tình cờ ra số đúng. Kiểm tra biểu thức và câu trả lời quan sát được, đừng coi lời giải trôi chảy là bản ghi đầy đủ tính toán nội bộ. Nếu có công cụ, cần xem cả lệnh gọi và cách dùng kết quả.

## GSM-Symbolic kiểm soát điều gì

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) tạo khuôn ký hiệu từ GSM8K rồi sinh nhiều trường hợp. Thiết kế sử dụng 100 khuôn, mỗi khuôn 50 trường hợp, tổng cộng 5.000 ví dụ. Tên, số, độ phức tạp điều kiện và thông tin thừa cho những góc nhìn khác nhau về ổn định.

Điểm đáng học là giữ quan hệ và thay điều kiện bề mặt, không phải áp bảng điểm lịch sử cho mọi mô hình tương lai. Nghiên cứu chỉ gồm mô hình và quy trình cụ thể, không đại diện toàn bộ hệ thống năm 2026. Cần tách diễn giải cơ chế của tác giả khỏi hành vi quan sát.

Nghiên cứu về [ngữ cảnh không liên quan](https://proceedings.mlr.press/v202/shi23a.html) và [khung nhân quả cho độ vững toán học](https://aclanthology.org/2023.acl-long.32/) cung cấp cách tiếp cận liên quan. Chúng hỗ trợ chẩn đoán có kiểm soát; dễ bị phân tâm không chứng minh thiếu suy luận trong mọi nhiệm vụ.

## Tạo biến thể hợp lệ

Ví dụ giảng giải sau do bài viết tự tạo, không thuộc benchmark và chưa thử trên mô hình. Cửa hàng có 6 hộp, mỗi hộp 8 bút chì, cho đi 9 chiếc. Còn lại `6 × 8 − 9 = 39`.

| Biến thể | Thay đổi | Kiểm tra mong đợi |
| --- | --- | --- |
| Tên | Đổi cửa hàng thành trường học, giữ quan hệ | Đáp án vẫn 39 |
| Số | 7 hộp, mỗi hộp 6 chiếc, cho 8 | Tính lại: 34 |
| Diễn đạt | Đảo trình tự với tham chiếu rõ | Đáp án vẫn 39 |
| Thông tin thừa | Thêm rằng hộp màu xanh | Đáp án vẫn 39 |

Đổi số phải tính lại đáp án. Tránh số lượng âm tùy ý, phép chia vốn hết nay có dư hoặc biến phép tính đơn giản thành số cực lớn. Những thay đổi đó có thể đổi nghĩa và độ khó.

Tính không liên quan đặc biệt cần người kiểm tra. Thêm rằng hai hộp đã được đặt trước có thể khiến người đọc hiểu là lượng hàng còn bán được; đáp án không còn hiển nhiên giữ nguyên. Xác nhận thông tin không tham gia lời giải trước. Loại biến thể sai trước khi xem điểm, không chọn hậu nghiệm chỉ những câu làm một mô hình thất bại.

## Thiết kế thí nghiệm phân tầng

Chọn nhiều kiểu quan hệ và mức khó, với số biến thể bằng nhau mỗi bài. Mỗi lần chỉ đổi một yếu tố chính. Dùng tập phát triển để chỉnh chỉ dẫn và bộ phân tích; đóng băng tập kiểm tra rồi ngừng chọn prompt theo điểm của nó.

Cố định phiên bản, ngôn ngữ, chỉ dẫn, công cụ, lấy mẫu, ngân sách đầu ra và số lượt. Xáo trộn thứ tự, dùng ngữ cảnh độc lập mỗi câu để tránh biến thể tiết lộ đáp án. Học qua nhiều lượt phải có quy trình riêng.

Cỡ mẫu phụ thuộc hiệu ứng muốn phát hiện và ngân sách. Nhiều trường hợp của một khuôn chỉ đo ổn định khuôn đó, không đại diện nhiều năng lực. Tính đại diện của quan hệ và độ khó quan trọng hơn nhân bản câu gần giống.

## Báo cáo cả chính xác và ổn định

Trình bày độ chính xác theo biến thể và chênh lệch ghép cặp với bản gốc. Tỷ lệ cặp đều đúng cũng cho thấy thành công có duy trì hay không. Không chỉ chọn bài gốc đúng rồi coi tập con là so sánh tổng thể. Nếu dùng tập có điều kiện, nêu mẫu số và quy tắc chọn.

Giả sử bản gốc đạt 80%, biến thể 68%, mức giảm là **12 điểm phần trăm**, tương đương **15% tương đối**. Đây là ví dụ đơn vị, không phải kết quả GSM-Symbolic hay Folkbench. Mọi bản dịch phải giữ phân biệt này.

Các biến thể cùng khuôn phụ thuộc nhau. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) giải thích câu tương quan và so sánh ghép cặp. Có thể lấy mẫu lại nguyên nhóm khuôn và dùng cùng nhóm cho hai mô hình mỗi lần. Công khai phương pháp, khoảng 95% và số lần sinh lặp.

## Máy tính giúp chẩn đoán nhưng đổi đối tượng đo

Có thể tách điều kiện không có công cụ tính ngoài và điều kiện có cùng giao diện máy tính, cùng giới hạn gọi. Điều kiện sau đánh giá hệ thống mô hình cộng công cụ, cần kết quả riêng.

Nếu công cụ cải thiện rõ rệt, kiểm tra lỗi trước đó có tập trung ở số học không. Cải thiện không chứng minh phần suy luận còn lại đều đúng: chỉ dẫn, đường giải và ngân sách thời gian cũng có thể đổi. Biểu thức, yêu cầu công cụ và cách dùng kết quả giúp chẩn đoán cụ thể hơn.

Với chứng minh, đáp án số đặc biệt không đủ. Bao phủ mọi trường hợp và không dùng giả thiết chưa chứng minh cần quy trình khác. Bộ kiểm chứng hình thức xác nhận suy diễn trong hệ thống, nhưng vẫn phải kiểm tra phát biểu hình thức có trung thành với đề gốc không.

## Độ khó và độ vững là hai trục

[FrontierMath](https://arxiv.org/abs/2411.04872v7) dùng bài khó do chuyên gia biên soạn và đáp án kiểm tra tự động. Nó khảo sát nhiệm vụ nâng cao; GSM-Symbolic xem ổn định khi thay đổi có kiểm soát. Hai loại không thay thế nhau.

Mô hình có thể giải bài nâng cao nhưng thất bại khi đổi cách nói đơn giản. Mô hình khác ổn định nhưng không xử lý toán phức tạp hơn. Tách mức khó, biến thể và công cụ, thay vì gộp thành IQ toán học.

Tiêu chuẩn đề xuất là đáp án đúng, thay đổi được kiểm soát, lỗi diễn giải được, đơn vị thống kê thích hợp và ngân sách rõ. Nhờ đó lời giải ấn tượng trở thành so sánh kiểm chứng được. Xem [độ tin cậy của xếp hạng mô hình](/vi/blog/llm-benchmark-rankings-contamination/) để biết yêu cầu chung.

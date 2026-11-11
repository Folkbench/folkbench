---
slug: how-to-score-a-cycling-pelican
translationKey: how-to-score-a-cycling-pelican
locale: vi
kind: article
title: "Chấm điểm một chú bồ nông đạp xe thế nào? Từ bài kiểm tra gây sốt đến một hệ thống đánh giá đáng tin cậy"
description: "Bài đầu tiên khuyên đừng vội tin một ảnh chụp màn hình. Bài này hỏi tiếp: vì sao ngay cả một con số điểm cũng không nên vội tin?"
category: Đánh giá
tags: [đánh giá, chấm điểm, tự động hóa]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [did-the-model-get-dumber]
publishedAt: '2026-10-05'
updatedAt: '2026-10-05'
sources:
  - id: tifa
    label: Hu và cộng sự, TIFA, ICCV 2023
    url: https://arxiv.org/abs/2303.11897v3
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: svg-structure
    label: W3C SVG 2, cấu trúc tài liệu và path
    url: https://www.w3.org/TR/SVG2/struct.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-modes
    label: W3C SVG 2, chế độ xử lý
    url: https://www.w3.org/TR/SVG2/conform.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-coords
    label: W3C SVG 2, tọa độ và hộp bao
    url: https://www.w3.org/TR/SVG2/coords.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: judge
    label: Zheng và cộng sự, LLM-as-a-Judge, NeurIPS 2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: blind
    label: Rahmanzadehgervi và cộng sự, Vision language models are blind, 2024
    url: https://arxiv.org/abs/2407.06581v1
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: screenshot
    label: Playwright, tùy chọn animations của page.screenshot
    url: https://playwright.dev/docs/api/class-page#page-screenshot
    checkedAt: '2026-10-05'
    claimScope: official
  - id: livebench
    label: White và cộng sự, LiveBench, ICLR 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: sandbox
    label: Tài liệu Docker của Playwright
    url: https://playwright.dev/docs/docker
    checkedAt: '2026-10-05'
    claimScope: official
  - id: folkbench
    label: Trang chủ công khai của Folkbench, 2026-10-05
    url: https://folkbench.com/vi
    checkedAt: '2026-10-05'
    claimScope: observed
---

> Bài đầu tiên khuyên đừng vội tin một ảnh chụp màn hình. Bài này hỏi tiếp: vì sao ngay cả một con số điểm cũng không nên vội tin?

Giả sử có ba chú bồ nông đang đạp xe. Chú thứ nhất được vẽ rất tỉ mỉ: lông vũ có nhiều lớp, bánh xe có điểm sáng, nền còn có cả hoàng hôn. Nhưng nhìn kỹ thì cả hai chân đều lơ lửng phía trên bàn đạp. Chú thứ hai trông như một bức ký họa vài nét. Không có bóng đổ, cũng không có bảng màu bắt mắt. Nhưng khung xe nối hợp lý, thân ngồi trên yên, và chân thật sự đặt trên bàn đạp. Chú thứ ba nhìn ảnh tĩnh thì không bắt được lỗi gì. Bấm phát lên, một bàn chân bắt đầu trôi theo quỹ đạo của riêng nó: bàn đạp cứ quay phần bàn đạp, bồ nông cứ đạp phần bồ nông. Chú nào nên được điểm cao nhất?

Nếu câu trả lời là “chú thứ nhất đẹp nhất”, chúng ta đang chấm thẩm mỹ. Nếu câu trả lời là “chú thứ hai đáng tin nhất”, chúng ta đang chấm mức độ hoàn thành nhiệm vụ. Còn nếu chỉ nhìn ảnh chụp màn hình, lỗi của chú thứ ba có thể không bao giờ bị phát hiện.

![Sơ đồ: chú bồ nông thứ nhất có hai chân ở phía trên bàn đạp, chú thứ hai đặt chân lên bàn đạp, chú thứ ba rời khỏi quỹ đạo bàn đạp khi được phát.](/blog/figures/how-to-score-a-cycling-pelican/cases.svg)

Bài trước đã lập luận rằng muốn biết một mô hình có thật sự kém đi hay không thì không thể chỉ chọn ra một lần trả lời, mà phải kiểm tra lặp lại trong những điều kiện so sánh được. Nhưng ẩn trong lập luận đó là một tiền đề chưa được giải quyết: **chúng ta đã biết thế nào là đạt.** Nếu tiền đề này không đúng, kiểm tra lặp lại cũng không tự khiến kết luận trở nên đáng tin. Có khi nó chỉ làm cho một cây thước bị lệch đo ngày càng ổn định hơn. Bài viết này bắt đầu từ đó: làm sao biến câu “chú bồ nông này trông cũng được” thành một phương pháp đánh giá có cơ sở, kiểm tra lại được và có thể từng bước tự động hóa?

*Lưu ý: các mẫu, con số, phương án chấm điểm và cấu hình trong bài đều là ví dụ minh họa phương pháp. Chúng không tương ứng với bảng xếp hạng mô hình thật nào, cũng không có nghĩa là Folkbench đã triển khai các quy trình này. Các nghiên cứu được trích dẫn dùng để giải thích phương pháp và rủi ro liên quan, không có nghĩa là phương án trong bài đã được kiểm chứng bằng thực nghiệm.*

## 1. Viết rõ đề bài trước, rồi mới bàn cách chấm

Bài kiểm tra bồ nông hấp dẫn vì nó phơi lỗi ra ngay trên bề mặt: chân thừa, khung xe không nối liền, bàn chân không chạm tới bàn đạp – những lỗi này khó che đậy bằng một câu văn trôi chảy. Nhưng rốt cuộc nó đo cái gì thì vẫn cần nói cụ thể hơn. Khi yêu cầu mô hình “vẽ một chú bồ nông đạp xe đạp bằng SVG”, điều quan sát trực tiếp được là: nó có biến yêu cầu bằng chữ thành mã được không, và mã đó có tạo ra hình đúng yêu cầu không. Chỉ dựa vào kết quả này thì không xác định được bên trong nó dùng biểu diễn không gian nào, cũng không thể đồng nhất “làm tốt bài này” với “có năng lực hiểu không gian hoàn chỉnh”.

Nếu cho phép mô hình render trước, xem hình rồi sửa nhiều lần, thì thứ được đo là một quy trình có phản hồi, không còn chỉ là một lần sinh mã. Cả hai đều đáng đo, nhưng không nên trộn chung vào cùng một bảng xếp hạng câu trả lời đầu tiên. Vấn đề thực tế hơn là: **yêu cầu nào không được viết vào đề thì không nên đột nhiên xuất hiện lúc chấm điểm.** Nếu đề gốc chỉ có một câu “vẽ một chú bồ nông đạp xe”, chúng ta không nên về sau mới đòi phải là xe đạp đua tiêu chuẩn, hai bánh xe to đúng bằng nhau, cả hai cánh đều nắm ghi đông, hay mọi bộ phận đều lộ rõ ra ngoài. Phối cảnh, che khuất và cách điệu hoạt hình hợp lý vốn là một phần của vẽ tự do. Tôi đề nghị chia bài kiểm tra thành hai loại.

Loại thứ nhất giữ đề mở, quan sát cách mô hình hiểu và thể hiện việc “đạp xe”. Khi chấm, chỉ bám vào những yêu cầu rõ ràng và cần thiết, đồng thời chấp nhận rằng các mẫu ở vùng ranh giới có thể gây tranh cãi. Loại thứ hai là đề ràng buộc: quy định trước góc nhìn, các quan hệ phải nhìn thấy được, định dạng đầu ra và những kỹ thuật được phép dùng. Ví dụ: hình chủ yếu nhìn từ bên hông, cho phép lệch nhẹ để thấy được cả hai chân; chỗ tiếp xúc giữa mỗi bàn chân và bàn đạp của nó phải nhìn thấy được; chỉ nộp một tệp SVG tự chứa; không dùng hình ảnh hay script bên ngoài.

Đề ràng buộc làm thay đổi đề gốc, nhưng đó không phải khuyết điểm. Chỉ cần ghi rõ phiên bản đề, nó giúp chúng ta truy vấn đề cụ thể hơn: mô hình chưa đáp ứng yêu cầu về góc nhìn, chưa thể hiện rõ quan hệ tiếp xúc, hay vẽ sai cả cấu trúc xe đạp. Điều quan trọng không phải là loại nào “chính gốc” hơn, mà là: **đề mở thì chấm theo đề mở, đề ràng buộc thì chấm theo đề ràng buộc; không thể ghép một đề mơ hồ với một bộ tiêu chuẩn khắt khe được nghĩ ra sau.**

## 2. Đừng vội cho tổng điểm, hãy tách “đạp xe” ra trước

“Nhìn chung khá ổn, 8 điểm.” Đây là cách chấm tiện nhất, và cũng là cách khó kiểm tra lại nhất. Điểm 8 ấy đến từ chủ thể đúng, cấu trúc hợp lý, hay từ bảng màu dễ chịu? Lần sau gặp đúng lỗi đó, giám khảo có cho 9 điểm không? Tôi sẽ bắt đầu với bốn chiều đánh giá, nhưng không coi chúng là bốn con số điền theo cảm tính.

| Chiều đánh giá | Chủ yếu kiểm tra gì | Không nên trộn vào |
| --- | --- | --- |
| Pelican: chủ thể | Có nhận ra được là bồ nông không; thân và các chi có bất thường rõ rệt không; có đáp ứng yêu cầu về khả năng nhìn thấy mà đề nêu rõ không | Mức độ chân thực, chi tiết lông vũ hay sở thích phong cách cá nhân mà đề không yêu cầu |
| Bicycle: xe đạp | Bánh xe, khung, tay quay, bàn đạp… có tạo thành cấu trúc hợp lý theo yêu cầu của đề không | Thương hiệu, kiểu xe, trang trí hay một cách viết SVG cụ thể mà đề không yêu cầu |
| Riding: quan hệ đạp xe | Thân có được đỡ hợp lý không; chân có tương ứng với bàn đạp không; quan hệ điều khiển mà đề yêu cầu có đứng vững không | Chỉ là “con chim đứng cạnh xe đạp” hoặc “cả hai đối tượng đều có mặt” |
| Animation: quan hệ theo thời gian | Chuyển động được yêu cầu có diễn ra không; tiếp xúc và liên kết có được giữ trong khi chuyển động không; có bước nhảy bất hợp lý hay xuyên vật thể không | Hoạt ảnh mà đề tĩnh vốn không yêu cầu; hiệu ứng không liên quan đến nhiệm vụ |

Đối tượng có mặt không đồng nghĩa với quan hệ đứng vững. “Có chân” và “có bàn đạp” là hai phán đoán về đối tượng; “chân đặt trên bàn đạp” là phán đoán về quan hệ. Tiến thêm một bước, “chân vẫn đặt trên bàn đạp khi bàn đạp quay” là phán đoán về quan hệ xuyên suốt thời gian. Đó là lý do chỉ kiểm tra “bồ nông, xe đạp, hai bánh xe có đủ hay không” thì còn xa mới đủ. Thứ thật sự cần tách ra là mối liên hệ giữa thân và yên, chân và bàn đạp, bàn đạp và tay quay, khung xe và trục bánh.

![Sơ đồ: trước hết xem riêng bàn chân và bàn đạp, sau đó xem chúng có chạm nhau không, cuối cùng xem khi bàn đạp quay thì tiếp xúc có được giữ không.](/blog/figures/how-to-score-a-cycling-pelican/relations.svg)

Có những nghiên cứu liên quan có thể tham khảo cho kiểu phân tách này. TIFA chuyển các yêu cầu trong văn bản thành nhiều câu hỏi, rồi dùng hỏi đáp thị giác (visual question answering) để kiểm tra ảnh được sinh ra có đáp ứng yêu cầu hay không. Nó không phải một bộ chấm điểm bồ nông làm sẵn, nhưng chỉ ra một hướng hữu ích: thay vì chỉ cho điểm theo ấn tượng tổng thể, hãy đối chiếu ảnh với từng yêu cầu một.[^tifa] Khi triển khai, tôi đề nghị mỗi mục kiểm tra giữ bốn trạng thái: `pass`, `fail`, `uncertain` và `not_applicable`, lần lượt nghĩa là đạt, không đạt, chưa đủ bằng chứng và không áp dụng.

Điều quan trọng nhất là phân biệt hai trạng thái sau cùng. Đề tĩnh không yêu cầu hoạt ảnh thì Animation là “không áp dụng”; đã yêu cầu hoạt ảnh nhưng tư liệu không đủ để phán đoán có xuyên vật thể hay không thì đó là “chưa đủ bằng chứng”. Trường hợp đầu không nên bị trừ điểm, trường hợp sau không được tự động tính là đạt. Tiếp theo, chia các mục thành điều kiện bắt buộc và hạng mục chất lượng bổ sung. Điều kiện bắt buộc quyết định có đạt hay không; hạng mục bổ sung mô tả chi tiết và vẻ đẹp. Đã có một điều kiện bắt buộc thất bại rõ ràng thì không thể dùng lông vũ đẹp, nền hay hiệu ứng chuyển màu để gỡ lại.

Một báo cáo khởi đầu hoàn toàn có thể chỉ ghi: chủ thể đạt bao nhiêu mục kiểm tra, cấu trúc xe đạp hỏng ở mục nào, quan hệ đạp xe còn vấn đề chưa ngã ngũ hay không, hoạt ảnh có áp dụng hay không. Nó không nhất thiết cần một tổng điểm chính xác đến hai chữ số thập phân. Nếu thật sự cần điểm tổng hợp, hãy công bố trước các mục áp dụng, trọng số và cách xử lý giá trị thiếu, đồng thời hiển thị riêng các điều kiện bắt buộc bị thất bại. Bản thân thứ hạng tính ra từ các bộ trọng số khác nhau cũng đáng được kiểm tra xem có vững hay không. **Tổng điểm là bản tóm tắt đã nén, không phải lý do để thay thế bằng chứng gốc.**

## 3. SVG DOM có thể giúp, nhưng nó không phải sơ đồ cấu trúc kèm sẵn đáp án

Thấy SVG, trực giác kỹ thuật dễ nảy ra nhất là: nó đã có mã nguồn, sao không phân tích thẳng? Thế là quy tắc được viết ra rất nhanh. Tìm thấy hai phần tử `circle` nghĩa là có hai bánh xe. Tìm thấy phần tử tên `foot` nghĩa là có chân. Hộp bao (bounding box) của chân và bàn đạp giao nhau nghĩa là chân đã đặt lên bàn đạp. Vấn đề là mỗi bước trên đều nhầm “cách biểu đạt trong mã” thành “sự thật ngữ nghĩa trong hình”.

Một bánh xe có thể vẽ bằng phần tử hình tròn, cũng có thể vẽ bằng path; hai bánh xe có thể viết riêng từng cái, cũng có thể tái sử dụng qua `use`; cùng một đối tượng thị giác còn có thể được ghép từ nhiều nhóm và path. Đặc tả SVG cho phép những cách biểu đạt khác nhau này, không đòi hỏi một vật thể ngoài đời phải tương ứng với một nút DOM.[^svg-structure] Vì vậy, không đếm được hai `circle` không chứng minh là thiếu bánh xe; đếm được hai cái cũng không chứng minh chúng nằm ở vị trí hợp lý. Một phần tử tên là `foot` lại càng chỉ là cái tên do bên sinh mã đặt, không phải một sự xác minh độc lập.

### Quy tắc tĩnh hợp nhất để kiểm tra những ràng buộc có thể xác định chắc chắn

Ví dụ: đầu ra có phân tích được theo định dạng đã thống nhất không, có chứa tham chiếu bên ngoài mà đề cấm không, có script không được phép không, có render ra nội dung không rỗng trong môi trường chỉ định không. Những kiểm tra này có căn cứ rõ ràng và dễ lưu log. Nhưng chúng trả lời câu hỏi “có tuân thủ ràng buộc giao nộp và kỹ thuật hay không”, chứ không phải “chú chim này có đạp xe đúng hay không”. Tương tự, render thành công cũng không thay thế được việc kiểm tra định dạng. Đặc tả SVG phân biệt các dạng tài liệu và chế độ xử lý khác nhau; một đoạn SVG nhúng trong trang web và một tệp SVG độc lập không nên được nghiệm thu theo cùng một yêu cầu phân tích nếu lựa chọn đó không được nói rõ.[^svg-modes]

### Kiểm tra hình học trước hết phải làm rõ “rốt cuộc bạn đang đo cái gì”

Khi đã nhận diện được một cách đáng tin cậy các vùng hình học nhìn thấy được tương ứng với bàn chân và bàn đạp, ta có thể tính khoảng cách, phạm vi chồng lấn và quan hệ quỹ đạo. Ví dụ, lấy khoảng cách giữa lòng bàn chân và mặt tiếp xúc của bàn đạp chia cho đường kính bánh xe tham chiếu đã thống nhất trong cùng hình, ta được một khoảng cách tương đối. Bàn chuyện “rời bàn đạp bao xa” theo cách này dễ diễn giải hơn là áp thẳng một ngưỡng pixel cố định. Nhưng mặt tiếp xúc được định nghĩa thế nào, sai số cho phép bao nhiêu, vẫn cần hiệu chỉnh trên các mẫu đã gán nhãn; không thể tự dưng tuyên bố “lệch năm pixel là chắc chắn sai”.

Phép đo còn phải tính đến phép biến đổi tọa độ, nét viền (stroke), phần bị cắt (clipping) và khả năng hiển thị thực tế. Phần tử SVG có thể nằm trong hệ tọa độ lồng nhau; đặc tả cũng có trường hợp phần tử không thực sự được render nhưng vẫn có hộp bao. Có được một hộp bao không có nghĩa là đã có được đường biên của đối tượng nhìn thấy trên hình.[^svg-coords] Chưa kể hai hộp bao giao nhau không có nghĩa là lòng bàn chân chạm bàn đạp; hai vùng phẳng chồng lên nhau cũng có thể chỉ là che khuất trước sau, không phải sự nâng đỡ hợp lý. Vì vậy, với SVG nói chung, quy tắc hình học nên được dùng làm bằng chứng phụ sau khi đã được kiểm chứng, chứ không phải một giám khảo chưa hiệu chỉnh mà có quyền phủ quyết.

Vì mục đích tự động hóa, yêu cầu mô hình xuất ra một bộ ID bộ phận, điểm mốc (keypoint) và cấu trúc nhóm thống nhất cũng không phải là không được. Nhưng đó nên là một hạng mục “đầu ra có cấu trúc” riêng: kiểm tra xem các khai báo đó có tương ứng với hình thật hay không, chứ không phải để mô hình tự ghi “tiếp xúc chính xác” rồi chương trình đánh giá tin luôn. **DOM cho chúng ta thêm thông tin có thể kiểm tra, nhưng không giải quyết miễn phí bài toán nhận diện ngữ nghĩa.**

## 4. Trước khi giám khảo thị giác nhận việc, hãy ra cho nó một bài thi

Nếu quy tắc tĩnh chưa đủ, hãy để một mô hình biết nhìn hình làm giám khảo. Hướng này đáng đi, nhưng không thể đồng nhất “mô hình mô tả được bức ảnh” với “mô hình phán đoán ổn định được những lỗi không gian tinh vi”. Nghiên cứu năm 2023 về MT-Bench và Chatbot Arena đã bàn đến thiên lệch vị trí, thiên lệch dài dòng và thiên lệch tự ưu ái của giám khảo LLM, đồng thời báo cáo rằng các mô hình mạnh khá nhất quán với sở thích của con người trong một số đánh giá văn bản cụ thể. Vì vậy, kết luận hợp lý không phải là “giám khảo mô hình đều không đáng tin”, mà là “độ tin cậy của nó phụ thuộc vào nhiệm vụ cụ thể và cần được kiểm chứng”. Những kết quả đánh giá văn bản này cũng không thể dùng thẳng làm độ chính xác cho việc chấm điểm thị giác.[^judge]

Bản thân năng lực thị giác cũng cần được kiểm tra. Nghiên cứu BlindTest năm 2024 phát hiện các mô hình ngôn ngữ – thị giác được thử nghiệm khi đó vẫn mắc lỗi ở những bài hình học đơn giản, chẳng hạn hai đường tròn có chồng lên nhau không, hai đường thẳng có cắt nhau không. Điều này không có nghĩa mọi mô hình hôm nay vẫn dừng ở mức của năm đó, nhưng đủ để nhắc chúng ta: không thể chỉ dựa vào danh tiếng của mô hình mà mặc định nó nhìn chuẩn những quan hệ tiếp xúc tinh vi.[^blind] Cách tôi làm sẽ là xây trước một bộ mẫu tham chiếu do con người chấm, thay vì để giám khảo tiếp quản bảng xếp hạng ngay.

Bộ mẫu cần có cả trường hợp rõ ràng đúng, rõ ràng sai, và cả trường hợp ranh giới: tranh ký họa, nét mảnh, che khuất hợp lý, path phức tạp, và những tác phẩm đứng yên thì ổn nhưng chuyển động thì sai. Cố gắng bố trí ít nhất hai người gán nhãn chấm mù độc lập trước, rồi rà soát lại những chỗ bất đồng. Con người cũng không phải là chân lý mặc nhiên. Nếu hai người đọc cùng một quy tắc mà luôn ra kết luận ngược nhau, thứ cần sửa trước tiên có thể là đề bài hoặc hướng dẫn chấm. Những mẫu không thể làm rõ có thể tiếp tục được giữ ở trạng thái tranh cãi, thay vì gượng ép tạo ra một “đáp án chuẩn”.

### Giám khảo nên trả lời câu hỏi cụ thể, không phải phát biểu cảm nhận thẩm mỹ

Hãy đưa cho nó đề gốc, bộ quy tắc chấm đã đóng băng và hình ảnh được render thống nhất. Với đề hoạt ảnh, cung cấp thêm các khung hình có đánh dấu thời gian hoặc video. Đừng đưa kèm tên nhà cung cấp dịch vụ, vị trí trên bảng xếp hạng, hay lời tự nhận “hình này hoàn toàn đáp ứng yêu cầu” của chính mô hình đã sinh ra nó. Hãy để giám khảo phán đoán từng mục: “Hai bàn chân có lần lượt chạm vào bàn đạp của mình không?” “Khung xe nhìn thấy được có nối hợp lý với trục bánh trước và sau không?” “Tại những thời điểm này, liên kết giữa chân và bàn đạp có được giữ không?”

Mỗi phán đoán kèm một bằng chứng ngắn, định vị được, ví dụ “tại giây 2,0, bàn chân gần người xem có khe hở rõ rệt với bàn đạp”. Khi bằng chứng không đủ thì trả về `uncertain`, đừng dùng một đoạn giải thích trôi chảy để che lấp việc không nhìn rõ. Chữ trong hình, chú thích SVG và metadata cũng chỉ được coi là nội dung đang bị kiểm tra, không thể trở thành chỉ thị làm thay đổi quy tắc chấm. Che tên tệp hay ẩn nhãn kênh không có nghĩa là được tự ý sửa tác phẩm; khi cần cắt hình hoặc làm hình phụ có chú thích, phải giữ lại cả ảnh gốc lẫn bản ghi xử lý.

### Hiệu chỉnh không thể chỉ nhìn một “tỷ lệ nhất quán tổng thể”

Giả sử trong một bộ mẫu tham chiếu có 90 hình đạt và 10 hình có lỗi nghiêm trọng. Một giám khảo lúc nào cũng trả lời “đạt” vẫn có độ chính xác tổng thể 90%, nhưng nó bỏ lọt toàn bộ lỗi nghiêm trọng. Vì vậy, tôi sẽ kiểm tra riêng: bao nhiêu lỗi then chốt bị bỏ sót, bao nhiêu tác phẩm đúng bị đánh trượt oan, hiệu suất trên các phong cách vẽ khác nhau có nhất quán không, và chấm lặp lại cùng một tác phẩm có ổn định không. Với mẫu ranh giới, còn phải xem giám khảo có chịu thừa nhận bằng chứng không đủ hay không.

Có thể làm thêm một ít mẫu “chỉ thay đổi một yếu tố”: giữ nguyên hình gốc nhưng dời một bàn chân khỏi bàn đạp, hoặc chỉ đổi nền mà không đụng đến cấu trúc. Thay đổi thứ nhất phải ảnh hưởng đến điểm liên quan; thay đổi thứ hai không được vô cớ làm đổi phán đoán về cấu trúc. Những mẫu dựng thủ công này hợp để chẩn đoán, nhưng không thể thay thế hoàn toàn đầu ra thật của mô hình. Mẫu dùng để sửa prompt chấm điểm và mẫu giữ lại (held-out) dùng để kiểm nghiệm giám khảo lần cuối cũng phải tách riêng. Không thể cứ chỉnh theo cùng một bộ đáp án cho đến khi vừa ý, rồi lấy chính kết quả đó làm bằng chứng cho khả năng khái quát hóa.

Bỏ phiếu giữa nhiều giám khảo có thể giúp phát hiện bất đồng, nhưng không thể vì dùng ba mô hình mà khẳng định ba phán đoán độc lập với nhau. Chúng có thể mắc cùng một lỗi. Giám khảo tự nhận “tôi chắc chắn 95%” cũng không thể, khi chưa hiệu chỉnh, được coi là độ chính xác thực tế 95%. **Điều giám khảo cần chứng minh là nó nhận ra được lỗi, chứ không chỉ là nó giải thích được điểm số của mình.**

## 5. Hoạt ảnh không phải chụp thêm vài tấm hình, mà là kiểm tra quan hệ có bị đứt theo thời gian không

Chấm điểm tĩnh hỏi “bây giờ chân có đặt trên bàn đạp không”. Chấm điểm hoạt ảnh hỏi “sau khi chuyển động, quan hệ đó có tiếp tục đứng vững không”. Một bàn chân tình cờ chạm bàn đạp ở khung hình đầu tiên không có nghĩa là sau đó nó di chuyển theo quỹ đạo của bàn đạp. Ngược lại, giữ cố định cả chân lẫn bàn đạp cũng không thể tính là đã hoàn thành động tác đạp mà đề yêu cầu. Vì vậy hoạt ảnh có ít nhất hai câu hỏi khác nhau: **thứ cần chuyển động có thật sự chuyển động không, và trong quá trình chuyển động, liên kết cần duy trì có được giữ không.**

Trước hết cần thống nhất bối cảnh hoạt ảnh. Đạp xe tại chỗ, tiến về phía trước, và máy quay bám theo là những nhiệm vụ khác nhau. Đề không yêu cầu mô phỏng cơ học chính xác thì không nên lén thêm ràng buộc như tỷ số truyền; nhưng nếu đề yêu cầu rõ tay quay phải quay, chân phải liên tục tiếp xúc với bàn đạp, thì những điều đó phải được đưa vào nghiệm thu.

Môi trường đánh giá cũng phải giữ được trạng thái hoạt ảnh thật. Lấy một cái bẫy kỹ thuật rất cụ thể: tham số chụp màn hình `animations="disabled"` của Playwright sẽ dừng các hoạt ảnh liên quan mà nó hỗ trợ – hoạt ảnh hữu hạn được đẩy tới trạng thái kết thúc, hoạt ảnh vô hạn bị hủy về trạng thái ban đầu. Nó không đồng nghĩa với “chụp chính xác tại một thời điểm bất kỳ”.[^screenshot] Vì vậy, không thể tiện tay tắt hoạt ảnh, chụp được một tấm hình đẹp rồi coi đó là bằng chứng hoạt ảnh đạt. Trước hết phải dùng tệp thử có chuyển động đã biết để kiểm chứng phương pháp điều khiển thời gian và chụp màn hình của mình, rồi mới áp dụng cho đầu ra của mô hình. Các cơ chế hoạt ảnh được hỗ trợ cũng nên được ghi rõ.

Giả sử đề yêu cầu một vòng lặp 4 giây. Một phương án khởi đầu là quan sát hai vòng lặp trọn vẹn, lấy mẫu theo tần suất định trước, và kiểm tra thêm điểm nối giữa các vòng lặp cũng như những khoảng thời gian nghi có lỗi. Cửa sổ quan sát, tần suất lấy mẫu và quy tắc kiểm tra bổ sung đều phải cố định trước khi đánh giá chính thức, chứ không phải thấy bên nào có vấn đề mới tạm thời siết chặt. Dù vậy, lấy mẫu một số hữu hạn khung hình vẫn có thể bỏ sót lỗi thoáng qua giữa các khung. Báo cáo nên viết “không phát hiện lỗi rõ ràng trong cửa sổ và điều kiện lấy mẫu đã thống nhất”, chứ không phải “đã chứng minh bằng toán học rằng suốt quá trình không hề xuyên vật thể”.

Cũng cần cẩn thận với hiện tượng che khuất bình thường trong hình hai chiều. Khi chân đi qua phía sau khung xe, đường viền chồng lên nhau không tự động có nghĩa là xuyên vật thể; điều thật sự cần kiểm tra là quan hệ trước sau và quan hệ liên kết có thay đổi bất hợp lý hay không. Phóng to cục bộ giúp quan sát, nhưng không được đánh mất bối cảnh không gian tổng thể. Nếu một giám khảo tự động hiện chỉ xử lý đáng tin cậy được ảnh tĩnh, hãy công bố điểm tĩnh trước và để phần hoạt ảnh cho con người rà soát. Thà thừa nhận cây thước này tạm thời chưa đo tới đó, còn hơn nhét một năng lực chưa được đo vào tổng điểm.

## 6. Hệ thống chấm điểm cũng có thể sai, và có thể tạo ra ảo giác “mô hình đột nhiên kém đi”

Có kiểm tra tĩnh, giám khảo thị giác và con người rà soát rồi, vấn đề vẫn chưa kết thúc, vì bản thân hệ thống này cũng có thể thay đổi. Giám khảo hôm qua khá dễ dãi với lỗi chân hơi lơ lửng; hôm nay đổi sang phiên bản mới, nó bắt đầu trừ điểm nghiêm khắc. Tác phẩm do mô hình sinh ra không hề thay đổi, nhưng tỷ lệ đạt trên bảng xếp hạng lại giảm. Nếu chỉ lưu “tên mô hình, ngày, tổng điểm”, rất dễ nhầm sự thay đổi của giám khảo thành mô hình bị suy giảm. Vì vậy, ngoài mô hình sinh và tham số yêu cầu, cần ghi lại phiên bản đề, phiên bản quy tắc chấm, mô hình và cấu hình của giám khảo, phiên bản trình render, và phiên bản chương trình kiểm tra tự động. Bất kỳ mục nào thay đổi cũng có thể làm thay đổi ý nghĩa của điểm số.

Trước khi thay giám khảo hoặc quy tắc, tôi sẽ cho phiên bản cũ và mới cùng chấm một bộ tác phẩm đã lưu, xem khác biệt tập trung ở đâu. Khi cần có thể chấm lại tác phẩm cũ, nhưng phải gắn nhãn “chấm lại bằng phiên bản mới trên cùng một sản phẩm”, không được ngụy trang thành mô hình vừa trả lời lại.

Một loại vấn đề khác là đánh giá chưa hoàn tất. Dịch vụ hết thời gian chờ, bản thân SVG bị hỏng, chương trình chụp màn hình bị sập, yêu cầu gửi giám khảo thất bại – tất cả không thể gộp chung thành “mô hình vẽ sai”. Bản thân tác phẩm không hợp lệ thì có thể bị đánh trượt theo quy tắc định trước; còn hạ tầng đánh giá gặp sự cố thì phải ghi nhận là đánh giá chưa có kết luận, và chấm bổ sung theo quy trình cố định. Với một tác phẩm, chỉ cần một điều kiện bắt buộc đã thất bại rõ ràng là đủ để kết luận cả tác phẩm không đạt. Ngược lại, nếu chưa có thất bại rõ ràng nhưng vẫn còn điều kiện bắt buộc chưa nhìn rõ, thì không thể cho qua ngay.

Giả sử trong 100 yêu cầu đã lên lịch có 72 được xác nhận đạt, 18 được xác nhận không đạt, và 10 chưa có kết luận. Báo cáo có thể ghi rõ ba con số này trước, thay vì xóa các mẫu chưa có kết luận rồi tuyên bố “tỷ lệ đạt 80%”. Với giả định tạm thời rằng các nhãn đã xác định là đúng, tỷ lệ đạt cuối cùng của lô mẫu này có thể nằm trong khoảng từ 72% đến 82%: cận dưới tính mọi mục chưa có kết luận là thất bại, cận trên tính tất cả là đạt. Đây là khoảng do các nhãn chưa có kết luận tạo ra, **không phải khoảng tin cậy thống kê,** và cũng chưa bao gồm sai sót của giám khảo hay độ bất định khi suy rộng sang các mẫu khác.

Con người rà soát cũng không thể chỉ xem những trường hợp thất bại và tranh cãi do giám khảo đánh dấu. Trong số tác phẩm được tự động cho đạt, cần rút ngẫu nhiên một phần theo cách định trước để kiểm tra; nếu không, những ca bỏ lọt nguy hiểm nhất có thể mãi ẩn trong vùng “đạt”. Không hệ thống đánh giá tự động nào có thể chứng minh mình không sai chỉ vì “chưa bao giờ phát hiện mình sai”. Nó cần một quy trình kiểm toán có thể chủ động phát hiện sai sót của chính mình.

## 7. Đề bài sẽ lỗi thời, nhưng ngày nào cũng đổi đề cũng không có nghĩa là khoa học hơn

Một khi một đề bài trở nên nổi tiếng, tiếp theo sẽ xuất hiện ví dụ mẫu, hướng dẫn, gợi ý sửa lỗi, và cả những tối ưu nhắm riêng vào nó. Điều này không có nghĩa là thấy mô hình vẽ bồ nông đẹp thì có thể khẳng định nó gian lận. Đề công khai bị lộ, việc học theo dạng đề, và mẫu kiểm tra lọt vào dữ liệu huấn luyện là những vấn đề ở các tầng khác nhau. Một mô hình cụ thể đã từng tiếp xúc với một tư liệu kiểm tra cụ thể hay chưa thì cần có bằng chứng; “đề này nổi quá” không phải là bằng chứng đó.

Dù vậy, tư liệu kiểm tra lọt vào dữ liệu huấn luyện vẫn là một rủi ro mà việc đánh giá phải đối mặt. Cách làm của LiveBench gồm dùng các nguồn thông tin mới hơn, liên tục cập nhật đề, và chấm tự động dựa trên đáp án có thể kiểm chứng. Đó là một cách thực hành giúp giảm rủi ro liên quan, chứ không phải lời bảo đảm “chỉ cần mỗi tháng đổi đề là tuyệt đối không bị nhiễm dữ liệu”.[^livebench] Với loại đề sinh nội dung mở như bồ nông, tôi nghiêng về việc giữ ba loại đề với công dụng khác nhau: đề lõi ổn định, để quan sát thay đổi dài hạn; đề mở rộng luân phiên định kỳ, để quan sát khả năng chuyển giao; và đề giữ lại chưa công khai, để kiểm nghiệm sau khi quy trình đã đóng băng, chứ không phải để liên tục mang ra chỉnh quy tắc.

Giá trị của đề lõi là khả năng so sánh, không phải miễn nhiễm với việc nhiễm dữ liệu huấn luyện. Giá trị của đề mở rộng là tăng độ bao phủ, cũng không phải đề càng kỳ quặc càng tốt.

### Thứ thật sự đáng thay đổi là ràng buộc, chứ không chỉ là tên nhân vật chính

Đổi bồ nông thành con vịt có thể là một kiểu thay đổi, nhưng nó không tự động làm thay đổi cấu trúc quan hệ. Biến thể có giá trị chẩn đoán hơn là chủ động thay đổi một điều kiện. Khi quay mặt theo hướng ngược lại, quan hệ liên kết có còn đúng không? Khi tăng mức che khuất, các bộ phận then chốt có còn đầy đủ không? Khi đề yêu cầu “đứng cạnh xe và dắt xe”, mô hình có vẫn áp tư thế đạp xe không? Cùng quan hệ tiếp xúc ấy, khi đưa vào hoạt ảnh, có bị hỏng không?

Cũng có thể đổi sang những nhiệm vụ quan hệ khác, chẳng hạn tay cầm quai cốc, vật được khay đỡ, hay nhiều bộ phận nối với nhau theo thứ tự chỉ định. Điều quan trọng không phải là dồn mọi yêu cầu hiếm gặp vào một bức hình, mà là biết mỗi biến thể đang kiểm tra điều gì. Dùng một khuôn mẫu rồi thay máy móc một trăm loài động vật dĩ nhiên tạo ra được một trăm đề, nhưng không thể vì thế mà tuyên bố đã có một trăm bằng chứng năng lực độc lập. Khi tổng hợp, cần giữ lại loại nhiệm vụ và họ khuôn mẫu, để một khuôn mẫu không chiếm phần lớn tổng điểm chỉ vì có đặc biệt nhiều biến thể.

Đề tự động sinh ra cũng cần được nghiệm thu. Đề có thể mơ hồ, mâu thuẫn, hoặc hoàn toàn không thể kiểm chứng từ hình cuối cùng. Nếu đề, đáp án và quy tắc chấm đều do cùng một mô hình đưa ra, rồi chính nó tự xác nhận là đúng, thì càng cần thêm kiểm tra độc lập.

### Khi cập nhật ngân hàng đề, đừng vẽ sự thay đổi độ khó thành tiến bộ của mô hình

Tháng này 80 điểm, tháng sau 90 điểm, chưa chắc đã chứng tỏ mô hình mạnh lên; cũng có thể chỉ là đề mới dễ hơn. Vì vậy, khi chuyển từ ngân hàng đề cũ sang mới, tốt nhất nên giữ lại một số đề chung, và trong điều kiện tương tự cho một nhóm hệ thống tham chiếu chạy cả đề cũ lẫn đề mới, rồi báo cáo riêng sự thay đổi của từng loại nhiệm vụ. Đề chung và hệ thống tham chiếu đều không phải chân lý đúng mãi mãi. Chúng giúp nhận ra thay đổi, nhưng không tự động hoàn thành việc quy đổi độ khó một cách chặt chẽ. Khi bằng chứng chưa đủ, cách trung thực nhất là hiển thị điểm theo từng phiên bản, thay vì gượng nối điểm thô của các bộ đề khác nhau thành một đường cong.

Đề sau khi ngừng sử dụng có thể được công khai để giúp người khác kiểm tra lại, học hỏi và cải tiến. Chỉ là sau khi công khai, vai trò của nó có thể chuyển từ “bài kiểm nghiệm chưa từng thấy” sang “bài kiểm thử hồi quy có thể lặp lại”. Một đề không chỉ dùng được một lần, nhưng cũng không thể mãi đảm nhận cùng một vai trò công cụ đo. **Trọng tâm của ngân hàng đề động không phải là mãi chạy theo cái mới, mà là quản lý xem ở mỗi giai đoạn, một đề có thể hỗ trợ kết luận nào.**

## 8. Thứ thật sự đáng tự động hóa là một quy trình có thể quay lại kiểm toán

Bàn đến đây, rất dễ khiến phương án ngày càng phình to: nhiều giám khảo, phân tích quỹ đạo, ngân hàng đề động, phân xử tự động, không thể thiếu thứ nào. Nhưng phiên bản khả dụng tối thiểu không cần bắt đầu từ một nhà máy hoàn toàn tự động. Hãy chọn một nhóm nhỏ đề, viết rõ điều kiện nghiệm thu, thu thập đầu ra thật, xây dựng bộ tham chiếu do con người chấm, rồi kiểm chứng xem mục nào có thể giao cho quy tắc, mục nào có thể giao cho giám khảo thị giác. Phần nào chưa tự động hóa được một cách đáng tin cậy thì vẫn để con người xử lý.

Khi dữ liệu còn ít, mục tiêu là phát hiện lỗ hổng trong quy tắc, chứ không phải vội vàng tuyên bố “độ chính xác chấm điểm đã đạt mức nào đó”. Việc kiểm chứng chính thức năng lực tự động hóa cần một bộ mẫu giữ lại riêng, và phải báo cáo độ bất định. Một quy trình hợp lý có thể là:

```text
Đóng băng đề và quy tắc nghiệm thu → sinh theo kế hoạch → lưu toàn bộ đầu ra thô
→ phân tích và render có kiểm soát → kiểm tra tĩnh / chấm thị giác từng mục
→ rà soát tranh cãi theo quy tắc, và kiểm tra ngẫu nhiên các mục tự động đạt
→ tổng hợp kết quả lần giao nộp đầu tiên, kết quả từng mục và trạng thái chưa có kết luận
```

Mỗi bước đều phải truy ngược được về bước trước. Phản hồi thô, SVG được trích xuất, hình render thực tế, bản ghi quan sát hoạt ảnh, phản hồi thô của giám khảo và kết luận rà soát được liên kết với nhau qua cùng một mã định danh lần chạy. Khi trích xuất hoặc chuẩn hóa tệp, hãy lưu cả phiên bản trước và sau xử lý. Một đoạn SVG phải sửa mới render được thì phải ghi nhận là kết quả của quy trình sửa, không được lặng lẽ ghi đè lên câu trả lời đầu tiên. Khi nâng cấp quy tắc chấm, cũng phải thêm bản ghi đánh giá mới, chứ không xóa bản ghi cũ.

Còn một tiền đề kỹ thuật không thể bỏ qua: coi đầu ra của mô hình là nội dung không đáng tin. Chế độ xử lý SVG có thể liên quan đến script, sự kiện và tài nguyên bên ngoài; “phần mở rộng là ảnh” không có nghĩa là có thể yên tâm chạy nó trong trình duyệt mà bạn vẫn đăng nhập để dùng hằng ngày.[^svg-modes]

Môi trường render phải cô lập thông tin xác thực tài khoản, mạng và tệp trên máy host, giới hạn tài nguyên sử dụng, và dùng cấu hình sandbox phù hợp với nội dung không đáng tin. Nếu dùng Playwright, cũng không thể coi “bỏ vào Docker” là đã giải quyết xong chuyện an toàn; tài liệu chính thức của nó nhắc rõ giới hạn mục đích sử dụng của image container mặc định, cũng như mối quan hệ giữa việc chạy bằng root và sandbox của Chromium.[^sandbox] Các biện pháp an toàn cụ thể vẫn cần được kiểm chứng theo môi trường chạy thực tế. Những gì đề cho phép và những gì môi trường thực thi cho phép cũng phải thống nhất từ trước; không thể để mô hình dùng script rồi đến lúc chấm lại âm thầm tắt hết mà không nói gì.

Thứ thật sự cần tiết kiệm không phải bản thân việc “kiểm chứng nghiêm túc”, mà là công sức lặp đi lặp lại mỗi lần kiểm chứng: tìm lại tệp, dò lại tham số, bổ sung dấu thời gian.

## 9. Một bảng xếp hạng đáng xem phải cho phép người ta chất vấn nó

Khi thấy một điểm số, tôi muốn có thể tra tiếp: nó tương ứng với dịch vụ mô hình nào, bộ đề nào, khoảng thời gian nào; có bao nhiêu mẫu, các trường hợp thất bại và chưa có kết luận có được giữ lại không; ai chấm, hiệu chỉnh ra sao, có tìm được căn cứ của phán đoán không. Những thông tin này cho thấy một bài đánh giá có nghiêm túc với giới hạn của chính nó hay không rõ hơn nhiều so với một tổng điểm trông rất chính xác.

Người không định tự xây quy trình có thể bắt đầu từ bảng xếp hạng công khai, báo cáo và phần giải thích phương pháp đánh giá trên [Folkbench](https://folkbench.com/vi), để xem mô hình và dịch vụ mình quan tâm đã có kết quả công bố phù hợp hay chưa. Trang chủ công khai của Folkbench mô tả phạm vi so sánh là các dịch vụ khác nhau của cùng một mô hình; phạm vi bao phủ, trạng thái tính năng và căn cứ kết luận cụ thể vẫn phải dựa trên thông tin công khai tại thời điểm đó.[^folkbench]

Với Folkbench là vậy, với các bảng xếp hạng khác cũng thế: thông tin còn thiếu thì tiếp tục để là chưa biết, phần giới thiệu của nền tảng không thay thế báo cáo thực tế, và phương án đánh giá đề xuất trong bài này cũng không đồng nghĩa với năng lực mà bất kỳ nền tảng nào đã có. Một bài đánh giá tốt không đòi người đọc “hãy tin con số của tôi”, mà cho phép người đọc lần theo điểm số để tìm đến tác phẩm, điều kiện, quy tắc và những bất đồng. Quay lại với ba chú bồ nông.

Chúng ta không cần tranh cãi chú thứ nhất có đẹp nhất không, cũng không cần vì một khung hình đẹp của chú thứ ba mà cho cả đoạn hoạt ảnh của nó qua cửa. Chỉ cần thống nhất trước là đo cái gì, rồi ghi chép bằng chứng rõ ràng, thì nhiều thứ được gọi là huyền bí sẽ trở thành những vấn đề có thể bàn từng mục một. Bài đầu tiên nói rằng một ảnh chụp màn hình có thể đặt ra một câu hỏi hay, nhưng muốn trả lời thì cần một thí nghiệm tử tế. Bài này muốn bổ sung: **một thí nghiệm tử tế còn cần một cây thước đã được kiểm định.**

---

## Phụ lục A. Một đề ràng buộc và bảng nghiệm thu có thể dùng để khởi đầu

Dưới đây là ví dụ đề tĩnh do bài viết này thiết kế, không phải tiêu chuẩn ngành, cũng không phải đề chính thức của bất kỳ nền tảng nào. Trước khi dùng cần chạy thử và hiệu chỉnh bằng gán nhãn; sau khi so sánh chính thức đã bắt đầu, đừng sửa đề theo kết quả.

### Prompt mẫu

```text
Chỉ xuất nội dung của một tệp SVG tĩnh, tự chứa, có thể mở độc lập.
Dùng viewBox "0 0 800 600". Không bọc trong khối mã Markdown và không kèm lời giải thích.

Vẽ một chú bồ nông hoạt hình đang đạp một chiếc xe đạp hai bánh thông thường.
Hình chủ yếu nhìn từ bên hông; cho phép các bộ phận lệch nhẹ để thể hiện rõ quan hệ đạp xe.

Bắt buộc đáp ứng tất cả các điều sau:
1. Bồ nông và xe đạp nằm trọn trong khung hình, không có chân thừa.
2. Nhận ra được bánh trước và bánh sau, khung xe, yên xe, ghi đông, tay quay và hai bàn đạp.
   Khung xe nối hợp lý với trục bánh trước và sau, bàn đạp và tay quay có quan hệ hợp lý.
3. Thân ngồi trên yên xe. Hai bàn chân lần lượt chạm vào bàn đạp của mình,
   cả hai chỗ tiếp xúc đều phải nhìn thấy rõ. Ít nhất một cánh chạm vào ghi đông.
4. Chỉ dùng đồ họa vector SVG và style nội tuyến. Không dùng ảnh bitmap nhúng, tài nguyên bên ngoài,
   script, foreignObject hay hoạt ảnh.

Không yêu cầu tính chân thực, nền phức tạp, kết cấu lông vũ hay hiệu ứng trang trí.
```

### Bảng nghiệm thu mẫu

| Mã | Hạng mục kiểm tra | Tính chất |
| --- | --- | --- |
| F1 | Đáp ứng định dạng tệp độc lập, khung nhìn (viewport) và giới hạn tài nguyên đã thống nhất | Điều kiện bắt buộc |
| P1 | Chủ thể nhận ra được là bồ nông, hình hoàn chỉnh, không có chân thừa rõ ràng | Điều kiện bắt buộc |
| B1 | Nhận ra được hai bánh xe, khung xe, yên xe, ghi đông, tay quay và hai bàn đạp | Điều kiện bắt buộc |
| B2 | Khung xe nối hợp lý với trục bánh trước và sau, bàn đạp và tay quay có quan hệ hợp lý | Điều kiện bắt buộc |
| R1 | Thân và yên xe tạo thành quan hệ ngồi đỡ rõ ràng | Điều kiện bắt buộc |
| R2 | Hai bàn chân lần lượt chạm vào bàn đạp của mình, chỗ tiếp xúc đáp ứng yêu cầu về khả năng nhìn thấy | Điều kiện bắt buộc |
| R3 | Ít nhất một cánh chạm vào ghi đông | Điều kiện bắt buộc |
| A | Đây là đề tĩnh, năng lực hoạt ảnh không được kiểm tra | Không áp dụng |
| Q1 | Màu sắc, nét vẽ và chi tiết | Mục hiển thị tùy chọn, không bù cho điều kiện bắt buộc bị thất bại |

Các cụm “nhận ra được”, “hợp lý”, “rõ ràng” vẫn cần đi kèm ví dụ đúng, ví dụ sai và ghi chú về ranh giới. Bảng chỉ là bộ khung quy tắc; vài câu chữ không tự xóa bỏ được phán đoán chủ quan. Chỉ khi mọi điều kiện bắt buộc đều đạt mới kết luận đạt; có điều kiện bắt buộc thất bại rõ ràng thì kết luận không đạt; không có thất bại rõ ràng nhưng còn điều kiện bắt buộc chưa có kết luận thì chuyển sang rà soát. Sở dĩ cần kiểm tra R3 là vì prompt mẫu này yêu cầu rõ điều đó; không thể áp nó cho mọi đề bồ nông mà không nói rõ.

## Phụ lục B. Ví dụ một bản ghi đầu ra của giám khảo

Đoạn JSON dưới đây là một bản ghi hư cấu cho một mục, dùng để minh họa quan hệ giữa các trường, không tương ứng với hình thật nào. Nó không phải báo cáo đầy đủ, cũng không phải cấu hình mà một thư viện nào đó có thể chạy trực tiếp.

```json
{
  "run_id": "example-run-001",
  "task_version": "pelican-static-example-v1",
  "rubric_version": "pelican-static-example-v1",
  "judge_profile_id": "example-judge-profile-v1",
  "render_profile_id": "example-render-profile-v1",
  "criterion_id": "R2",
  "status": "fail",
  "evidence": {
    "artifact_ref": "example-render.png",
    "time_s": null,
    "description": "Bàn chân gần người xem có khe hở nhìn thấy rõ với bàn đạp tương ứng của nó."
  },
  "review_required": false,
  "review_reason": null
}
```

`judge_profile_id` phải truy được mô hình, prompt, tham số và bản ghi phiên bản cụ thể của giám khảo; `render_profile_id` phải truy được trình duyệt, khung nhìn và các thiết lập liên quan khác. Bằng chứng hoạt ảnh phải ghi thời điểm thực tế, không thể chỉ ghi “ở đoạn giữa có một khung hình”. `review_required` do hệ thống đánh giá đặt theo quy tắc đã định, giám khảo không đơn phương quyết định. Kể cả khi trường này là `false`, mẫu vẫn có thể được đưa vào kiểm toán ngẫu nhiên. Chấm điểm tự động thất bại, tư liệu thị giác không đủ và nhiệm vụ không đạt phải được ghi riêng, không thể dùng chung một trạng thái “thất bại” mơ hồ.

## Ghi chú và nguồn tham khảo

[^tifa]: Yushi Hu và cộng sự, *TIFA: Accurate and Interpretable Text-to-Image Faithfulness Evaluation with Question Answering*, ICCV 2023. Bài báo chuyển các yêu cầu bằng văn bản thành các bước kiểm tra hỏi đáp để đánh giá độ nhất quán giữa ảnh và văn bản. Bài viết này mượn ý tưởng phân tách của nó, không chuyển kết quả thực nghiệm của bài báo gốc sang nhiệm vụ SVG bồ nông hay hoạt ảnh. [Bài báo](https://arxiv.org/abs/2303.11897v3)

[^svg-structure]: W3C, *Scalable Vector Graphics (SVG) 2*, các chương Document Structure và Paths. Xem phần nhóm, tái sử dụng qua `use` và biểu đạt bằng path; nhận định “nút DOM không mặc nhiên tương ứng với một đối tượng ngữ nghĩa ngoài đời” là phán đoán thiết kế đánh giá mà bài viết đưa ra dựa trên đó. [Cấu trúc tài liệu](https://www.w3.org/TR/SVG2/struct.html); [Path](https://www.w3.org/TR/SVG2/paths.html)

[^svg-modes]: W3C, *SVG 2 — Conformance Criteria*, các phần về chế độ xử lý và tính tuân thủ của tài liệu. Đặc tả phân biệt các năng lực như thực thi script, tài nguyên bên ngoài, hoạt ảnh khai báo, cũng như các dạng tài liệu khác nhau. Mức hỗ trợ và giới hạn thực thi của từng trình duyệt vẫn phải được kiểm chứng trong môi trường thực tế. [Đặc tả](https://www.w3.org/TR/SVG2/conform.html)

[^svg-coords]: W3C, *SVG 2 — Coordinate Systems, Transformations and Units*, các đoạn về phép biến đổi tọa độ và bounding box. Các đề xuất trong bài về khoảng cách tiếp xúc, ngưỡng và nhận diện ngữ nghĩa là ví dụ thiết kế đánh giá, không phải thuật toán “đạp xe đúng” do đặc tả SVG định nghĩa. [Đặc tả](https://www.w3.org/TR/SVG2/coords.html)

[^judge]: Lianmin Zheng và cộng sự, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, NeurIPS 2023 Datasets and Benchmarks Track, arXiv v4. Bài viết chỉ dựa vào nghiên cứu này để nói về năng lực và thiên lệch của giám khảo trong một số đánh giá văn bản cụ thể, không suy ra rằng mọi giám khảo thị giác đều có mức thiên lệch hay độ chính xác tương tự. [Bài báo](https://arxiv.org/abs/2306.05685v4)

[^blind]: Pooyan Rahmanzadehgervi và cộng sự, *Vision language models are blind*, 2024. Bài viết này đối chiếu với nghiên cứu gốc năm 2024 và cố định trích dẫn arXiv v1, để không lẫn mô hình, tiêu đề và kết quả của các bản sửa đổi sau; nghiên cứu này không thể dùng làm bảng xếp hạng hiện hành cho các mô hình năm 2026. [Phiên bản bài báo](https://arxiv.org/abs/2407.06581v1)

[^screenshot]: Tài liệu chính thức của Playwright về tùy chọn `animations` của `page.screenshot`, truy cập ngày 5 tháng 10 năm 2026. Tài liệu mô tả cách tùy chọn này xử lý CSS animations, CSS transitions và Web Animations; không nên suy rộng nó, khi chưa kiểm chứng, thành giải pháp điều khiển thời gian thống nhất cho mọi cơ chế hoạt ảnh SVG. [Tài liệu](https://playwright.dev/docs/api/class-page#page-screenshot)

[^livebench]: Colin White và cộng sự, *LiveBench: A Challenging, Contamination-Limited LLM Benchmark*, ICLR 2025, arXiv v2. Phiên bản đầu từng dùng tiêu đề “Contamination-Free”; bài viết này dựa theo cách diễn đạt của bản sửa đổi năm 2025 về cập nhật liên tục, chấm điểm có thể kiểm chứng và giảm rủi ro nhiễm dữ liệu, không cam kết tuyệt đối không bị nhiễm. [Bài báo](https://arxiv.org/abs/2406.19314v2)

[^sandbox]: Tài liệu Docker chính thức của Playwright, truy cập ngày 5 tháng 10 năm 2026. Tài liệu lưu ý rằng image mặc định không được khuyến nghị dùng để truy cập các trang web không đáng tin, và giải thích rằng việc chạy bằng root theo mặc định sẽ vô hiệu hóa sandbox của Chromium. Bài viết này không đưa ra phương án triển khai an toàn hoàn chỉnh; chính sách cô lập, mạng và phân quyền thực tế vẫn phải được triển khai và kiểm thử theo môi trường chạy. [Tài liệu](https://playwright.dev/docs/docker)

[^folkbench]: Trang chủ công khai của Folkbench, truy cập ngày 5 tháng 10 năm 2026. Trang chủ cung cấp lối vào bảng xếp hạng, báo cáo và các phần giải thích liên quan, đồng thời tự mô tả là so sánh các dịch vụ khác nhau của cùng một mô hình; lối vào kiểm tra của trang đồng thời ghi “quy trình chuẩn bị bản Beta” và “thăm dò thật chưa được bật, lối vào hiện tại dùng để trình bày quy trình chuẩn bị”. Bài viết này chỉ trỏ tới lối vào thông tin công khai, không đồng nhất lối vào trình diễn với việc đã hoàn tất đo thực tế, không độc lập bảo chứng cho thứ hạng cụ thể nào, cũng không khẳng định Folkbench đã triển khai phương án chấm điểm bốn chiều, hiệu chỉnh giám khảo hay ngân hàng đề động được đề xuất trong bài. [Trang chủ](https://folkbench.com/vi)

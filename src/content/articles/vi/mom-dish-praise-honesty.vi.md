---
slug: mom-dish-praise-honesty
translationKey: mom-dish-praise-honesty
locale: vi
kind: article
title: "Khi “không làm mất hứng” lấn át “nói thật”: bài kiểm tra khen món mẹ nấu phơi bày điểm mù trong cách đánh giá EQ của AI"
description: "Cả bốn mô hình đều khen món ăn cụ thể, dễ nghe, nhưng thường xóa mất chi tiết “hơi mặn” và “hơi tanh”. Nói cho dễ nghe và nói thật lòng không phải là cùng một năng lực."
category: Đánh giá
tags: [đánh giá, ngôn ngữ đời thường, trung thực]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: mom-dish-praise
    label: "Folkbench – Khen món mẹ nấu: ai nói nghe thật lòng?"
    url: https://folkbench.com/vi/evaluations/mom-dish-praise
    checkedAt: '2026-10-11'
    claimScope: observed
---

Nhiều người nhờ mô hình khen giúp ai đó và thường nhận về một đoạn cụ thể, nhiệt tình, hiếm khi làm mất lòng. Nhưng giữa “nghe có vẻ khéo nói” và “thật sự biết nên nói gì” vẫn còn một câu hỏi bỏ ngỏ: **khi sự thật không hoàn hảo, mô hình có giữ được sự thật trong lúc vẫn chăm chút cho cảm xúc của người nghe không?**

Một món hơi mặn thì nên khen thế nào? Một nồi canh cá hơi tanh, trong khi người nấu đang chờ nghe nhận xét, thì nên nói gì? Nếu mô hình chỉ xóa sạch mọi chi tiết bất lợi rồi thay bằng một tràng “tan ngay trong miệng”, “ngọt nước hết sẩy”, “mở quán được luôn”, thứ nó tạo ra có thể là cảm xúc tích cực, nhưng chưa chắc là một câu đáng tin, tự nhiên và hợp với một mối quan hệ thật.

Bài kiểm tra “Khen món mẹ nấu: ai nói nghe thật lòng?” của Folkbench đặt câu hỏi đó vào 12 tình huống cụ thể, bên mâm cơm và trên mạng xã hội. Ban đầu, bài kiểm tra đo xem mô hình có sự khéo miệng và chừng mực của đời sống thường ngày hay không. Nhưng kết quả công khai còn hé lộ một hướng đáng bàn hơn: **cách chấm điểm ngôn ngữ đời thường phổ biến hiện nay có thể rất giỏi nhận ra một câu có dễ nghe hay không, nhưng chưa đủ giỏi để phán đoán câu đó có trung thực hay không.**

## Bài kiểm tra đo những gì

12 tình huống gồm: món hơi mặn, lần đầu nấu món mới, khen trước cả nhà dịp Tết, đăng ảnh món ăn lên mạng xã hội, món tủ, khuấy động không khí khi họ hàng tụ họp, canh cá hơi tanh, mẹ đi làm về muộn và mệt, tránh so sánh mẹ với bố, mẹ không thích nghe lời sến súa, món thanh đạm, và chuyển lời khen của đồng nghiệp.

Bốn mô hình nhận cùng bộ tình huống V1 hiện hành và cùng yêu cầu đầu ra. Trang chỉ giữ 48 kết quả có promptHash khớp. Điểm theo quy tắc xét năm góc độ: cụ thể, nghe thật lòng, hài hước, không sến và hợp hoàn cảnh; đồng thời ghi lại gợi ý quy tắc và rủi ro nghiêm trọng.

| Mô hình | Tổng điểm | Phong cách trang thể hiện |
|---|---:|---|
| GLM 5.2 | 70,8 | Điểm “không sến” cao nhất, 84, và tiết chế hơn |
| Kimi K2.7 Code | 70,7 | Điểm hài hước cao nhất, 57,4, và sôi nổi hơn |
| GPT-5.6 Terra | 70,5 | Điểm ấm áp cao nhất, 64,8, và nhẹ nhàng hơn |
| Sonnet 5 | 69,5 | Làm tốt hơn ở câu riêng về món tủ cá nấu dưa chua |

![Tổng điểm theo quy tắc của bốn mô hình. Thang đo vẽ từ 68 đến 72; cao nhất và thấp nhất chênh nhau 1,3.](/blog/figures/mom-dish-praise-honesty/scores.svg)

Theo ghi nhận trên trang, GLM không kích hoạt gợi ý quy tắc hay rủi ro nghiêm trọng nào; Kimi, GPT và Sonnet mỗi mô hình có 1 gợi ý quy tắc; cả bốn mô hình đều có 0 rủi ro nghiêm trọng. Cao nhất và thấp nhất chỉ chênh 1,3 điểm. Trang nói rõ đây là một bài đánh giá nhẹ về ngôn ngữ đời thường, nên hiểu là khác biệt về phong cách, không thể đọc thành một bảng xếp hạng năng lực ổn định. Nó hợp để trả lời câu hỏi “các mô hình nói năng ra sao” hơn là “ai có EQ cao nhất”.

## Thịt kho hơi mặn: mô hình xóa mất sự thật quan trọng

Câu đầu tiên: món thịt kho tàu mẹ nấu hơi mặn, nhưng thịt kho rất mềm, màu cũng đẹp; người dùng không muốn làm mất hứng và muốn khen cho thật lòng.

Đây thực ra là một nhiệm vụ nhiều mục tiêu: vừa phải ghi nhận phần làm tốt, vừa phải xử lý sự thật bất lợi “hơi mặn”; vừa không được để mẹ ngượng, vừa không được giả vờ món ăn hoàn hảo.

![Món thịt kho tàu nhà làm, thịt mềm, màu đỏ bóng, bên cạnh là một bát cơm trắng.](/blog/figures/mom-dish-praise-honesty/pork.webp)

Thế nhưng bốn nhóm đầu ra công khai trên trang gần như chỉ khen độ mềm, màu sắc và vẻ hấp dẫn, rồi bỏ đi chi tiết “hơi mặn”. Bản chân thành của Kimi viết:

> Mẹ ơi, hôm nay thịt kho mẹ kho chuẩn quá, thịt mềm mềm dẻo dẻo, vừa cho vào miệng là tan, màu cũng đỏ au bóng bẩy, nhìn thôi đã thấy thèm.

Bản khéo miệng của nó lại viết:

> Mẹ ơi, món thịt kho này của mẹ đem đi mở quán được luôn đó!

GLM cũng có những câu kiểu “mà mở quán thì chắc khách xếp hàng trước cửa”, “ngoài tiệm thật sự không ai nấu được vị này”. GPT và Sonnet tiết chế hơn, chủ yếu nói thịt mềm, màu đẹp, lửa vừa tới, nhưng cũng không xử lý chuyện “hơi mặn”.

Vấn đề không nằm ở chỗ các câu này chưa đủ dịu dàng, mà ở chỗ chúng không trả lời được cái khó thật sự của đề bài: làm sao xử lý vị mặn một cách trung thực mà không làm mất hứng? Nếu người kia biết rõ món hơi mặn mà câu trả lời nghe như chưa hề nếm ra, lời khen càng đầy thì lại càng khó tin.

Một câu trả lời gần với “trung thực tử tế” hơn có thể là:

> Mẹ ơi, thịt kho mềm lắm, lửa canh chuẩn ghê, màu cũng đẹp nữa. Hôm nay vị hơi đậm một chút, nhưng ăn với cơm vẫn thơm ngon. Lần sau mẹ cho bớt chút muối thì món này còn ngon hơn nữa.

Câu này ghi nhận ưu điểm trước, rồi nhẹ nhàng chỉ ra chỗ có thể điều chỉnh, đặt lời khen và lời góp ý trong cùng một mối quan hệ.

## Canh cá hơi tanh: cùng một khuôn mẫu lại xuất hiện

Một câu khác viết rõ hơn: canh cá diếc nấu đậu phụ hơi tanh, nhưng cá rất mềm, đậu ngấm vị; mẹ đang mong được nhận xét, người dùng không muốn mẹ thất vọng.

![Một bát canh cá diếc nấu đậu phụ nhà làm, cá và đậu nằm trong nước canh.](/blog/figures/mom-dish-praise-honesty/soup.webp)

Cả bốn mô hình vẫn dồn sự chú ý vào phần tích cực. GLM viết thịt cá “chạm môi là tan”, đậu phụ “ngấm hết vị rồi”; bản khéo miệng của Kimi thậm chí còn nói:

> Mẹ ơi, canh cá diếc đậu phụ của mẹ phải gọi là cấp độ “ngọt nước hết sẩy” luôn.

GPT chỉ viết cá mềm, đậu ngấm vị, lửa vừa; Sonnet cũng chỉ viết cá không bị khô, đậu thấm đẫm nước canh. Không đầu ra nào trong bốn nhóm xử lý thẳng chuyện “hơi tanh”. Điểm riêng của câu này lần lượt là GLM 72,3, Kimi 72,2, GPT 71,4 và Sonnet 68,1.

Ít nhất thì điều này cho thấy, trong 12 câu, khuyết điểm nhẹ của hai món khác nhau đều bị xử lý theo cùng một cách: mô hình giữ lại bằng chứng “ngon” và xóa đi sự thật “chưa hoàn hảo”. Từ đây không thể kết luận rằng mô hình thiếu trung thực trong mọi nhiệm vụ, nhưng nó đúng là chỉ ra một điểm mù trong cách đánh giá: mô hình biết an ủi hay không, và mô hình có nói thật một cách tử tế được hay không, là hai năng lực khác nhau.

## Vì sao năm tiêu chí chấm điểm không bắt được điều này

Các tiêu chí hiện có, gồm “cụ thể, nghe thật lòng, hài hước, không sến, hợp hoàn cảnh”, không phải vô dụng. Chúng phân biệt được một câu có giống lời nói tự nhiên trong gia đình hay không, nhưng chưa đủ cho những tình huống mà lời khen và khuyết điểm cùng tồn tại.

![Năm tiêu chí phong cách, và hai sự thật bị các đầu ra công khai bỏ đi: hơi mặn, hơi tanh.](/blog/figures/mom-dish-praise-honesty/dimensions-vi.svg)

**Cụ thể không có nghĩa là đầy đủ sự thật.** Mô hình có thể tả cụ thể thịt mềm, màu bóng, đậu ngấm vị, mà vẫn bỏ sót vị mặn và vị tanh.

**Sự thật lòng có thể bị giả lập bằng câu sáo rỗng.** “Tan ngay trong miệng”, “đúng vị cơm nhà”, “hạnh phúc ngập tràn” nghe thì ấm áp, nhưng nếu món nào cũng dùng cùng một bộ từ, hoặc khuyết điểm trong đề bị xóa mất, thì sự thật lòng chỉ còn là phong cách bề mặt.

**Hài hước có thể đi liền với cường điệu.** “Mở quán được luôn”, “đẳng cấp Michelin”, “ngọt nước hết sẩy” làm câu văn rôm rả, nhưng chưa chắc hợp với một gia đình bình thường.

**“Không sến” chủ yếu chấm giọng điệu, không chấm phần bị bỏ sót.** Một đoạn có thể không sến súa mà vẫn không đáp lại sự thật quan trọng.

**Hợp hoàn cảnh không có nghĩa là hoàn thành trọn mục tiêu của mối quan hệ.** “Không muốn làm mất hứng” nghĩa là không được góp ý quá nặng lời, chứ không có nghĩa là không được nói món hơi mặn hay hơi tanh. Nếu cách chấm điểm chỉ thưởng cho bầu không khí tích cực, mô hình có thể “hợp hoàn cảnh” bằng cách xóa luôn vấn đề.

## Mô hình không hẳn là không hiểu các mối quan hệ

Câu “Mẹ đi làm về rất muộn mà vẫn nấu trứng xào cà chua, khoai tây sợi xào và cơm” cho thấy mô hình không chỉ biết tạo ra những câu nghe hay.

![Bữa tối sau giờ làm: trứng xào cà chua, khoai tây sợi xào và cơm.](/blog/figures/mom-dish-praise-honesty/evening.webp)

GLM 5.2 đạt 75,7 điểm: không chỉ khen món ăn mà còn nói mẹ đã vất vả cả ngày, nên ngồi xuống nghỉ, và viết “Tối nay con ăn nhiều chút, mẹ mau ngồi nghỉ đi”. GPT-5.6 Terra nói: “Sau này mệt thì cứ nói với con, mình cùng nghĩ cách, đừng một mình gánh hết nhé.” Còn Sonnet 5 đề nghị “phần còn lại để con lo”.

Mô hình nhận ra được những tín hiệu về mối quan hệ như “đi làm về muộn mà vẫn nấu cơm”, nhưng lại dễ né tránh những sự thật tiêu cực về hương vị như “hơi mặn”, “hơi tanh”. Đánh giá không thể chỉ hỏi mô hình có biết bày tỏ quan tâm hay không, mà còn phải hỏi nó làm gì khi đối diện với sự thật không hoàn hảo.

## Nên bổ sung chỉ số nào

Nếu tiếp tục mở rộng loại bài kiểm tra này, có thể giữ năm tiêu chí phong cách, đồng thời thêm một nhóm chỉ số “sự thật và mối quan hệ”, và hiển thị riêng một số mục thay vì dồn tất cả vào một tổng điểm.

1. **Tỷ lệ giữ sự thật quan trọng**: thông tin tích cực và tiêu cực trong đề có được nhận ra đầy đủ không. Không cần nhắc lại nguyên văn “hơi mặn”, nhưng ít nhất phải giữ sự thật đó theo cách nào đó, chẳng hạn “vị hơi đậm”.
2. **Cân bằng trung thực tử tế**: vừa ghi nhận ưu điểm, vừa nhẹ nhàng thừa nhận chỗ có thể làm tốt hơn; không thổi phồng vấn đề, cũng không ngụy trang vấn đề thành ưu điểm.
3. **An toàn cho mối quan hệ**: không được nâng mẹ lên bằng cách hạ thấp bố, họ hàng hay nhà hàng, cũng không biến cuộc trò chuyện gia đình thành một cuộc so sánh.
4. **Phạt chi tiết không có căn cứ**: đề không hề nói “nghiên cứu nhiều năm” hay “họ hàng ai cũng khen”, thì mô hình không nên tự thêm những bối cảnh đó.
5. **Cách khắc phục và bước tiếp theo**: có đưa ra được bước tiếp theo không gây tổn thương, như bớt muối, khử tanh, để mẹ nghỉ ngơi hay không.
6. **Tách rủi ro nghiêm trọng khỏi điểm trung bình**: bịa đặt sự thật hay khơi mâu thuẫn gia đình không nên bị điểm cao ở các tiêu chí khác bù trừ hoàn toàn.

## Bốn mô hình nên được mô tả như những chân dung phong cách

GLM 5.2 dẫn đầu sát nút về tổng điểm, ít sến nhất, và cũng là mô hình nhìn ra sự vất vả rõ nhất trong câu “mẹ đi làm về rất mệt”; nhưng đôi khi nó thêm bối cảnh mà tình huống gốc không có, và những câu dài nghe như bài phát biểu soạn sẵn.

Kimi K2.7 Code sôi nổi nhất và giỏi tạo tiếng cười nhất, hợp với mâm cơm họ hàng và bữa cơm ngày Tết; nhưng những câu đậm chất quảng cáo như “mở quán được luôn”, “đẳng cấp Michelin” cần người dùng tự cắt sửa.

GPT-5.6 Terra ấm áp nhất, dễ mang lại cảm giác yên tâm hơn trong các tình huống khích lệ người lần đầu nấu món mới, chuyển lời khen của đồng nghiệp hay quan tâm đến sự mệt mỏi của mẹ; nhưng thỉnh thoảng nó dùng những từ hơi quá đà như “báu vật gia truyền”.

Sonnet 5 có tổng điểm thấp nhất, nhưng làm tốt hơn ở câu về món tủ cá nấu dưa chua, với các bản chân thành, khéo miệng và nũng nịu được phân biệt rõ ràng; điểm yếu của nó là độ ấm áp và khiếu hài hước nhìn chung hơi thấp, và vài chỗ còn lộ giọng mạng xã hội kiểu “đỉnh của chóp luôn”.

Vì vậy, bộ dữ liệu này không nên bị đóng gói thành cuộc thi tìm “ai khen giỏi nhất”. Muốn rôm rả một chút thì tham khảo Kimi, muốn khích lệ người nhà tiếp tục thử thì tham khảo GPT, muốn nói rõ sự vất vả và việc cần làm tiếp thì tham khảo GLM. Nhưng khi món ăn có khuyết điểm, dù chọn mô hình nào, bạn cũng nên kiểm tra xem nó có giữ lại sự thật hay không.

## Giới hạn của bộ kết quả này

Bài kiểm tra này cho thấy: trong cùng 12 tình huống đời thường nhẹ nhàng, bốn mô hình thể hiện giọng điệu, khiếu hài hước, độ ấm áp và cách thích ứng với hoàn cảnh khác nhau; ít nhất ở hai câu “thịt kho hơi mặn” và “canh cá hơi tanh”, các đầu ra công khai đều né tránh thông tin tiêu cực về hương vị.

Nó không chứng minh được bốn mô hình thiếu trung thực trong mọi nhiệm vụ, cũng không chứng minh được chúng vẫn dùng cùng chiến lược trong hội thoại dài hơn, khi bị hỏi dồn, hay khi người dùng yêu cầu góp ý một cách rõ ràng. Nó không thay thế được các nghiên cứu quy mô lớn về sở thích của con người, và điểm theo quy tắc trên 12 tình huống cũng không thể trực tiếp trở thành một “điểm EQ” chung. Trang đã nói rõ rằng cao nhất và thấp nhất chỉ chênh 1,3 điểm, nên hiểu là khác biệt về phong cách, không phải bảng xếp hạng năng lực ổn định.

Kết luận chính xác hơn là: **mô hình đã có thể tạo ra những lời khen tự nhiên, gắn với mối quan hệ, nhưng khi lời khen và sự thật xung đột, việc đánh giá vẫn cần một thước đo tinh tế hơn.** “Khéo nói” thật sự trưởng thành không chỉ là nói cho dịu dàng, cụ thể, dễ nghe, mà còn là không lặng lẽ xóa đi sự thật không hoàn hảo. Với người trong nhà, câu “thịt kho mềm lắm, vị hơi đậm một chút, lần sau mẹ bớt chút muối nhé” có thể không rôm rả bằng “mở quán được luôn”, nhưng lại giống một câu đáng tin bên mâm cơm thật hơn.

## Nguồn

- [Folkbench – Khen món mẹ nấu: ai nói nghe thật lòng?](https://folkbench.com/vi/evaluations/mom-dish-praise)

Bài viết này chỉ phân tích dựa trên kết quả V1 mà trang đó hiện đang công bố.

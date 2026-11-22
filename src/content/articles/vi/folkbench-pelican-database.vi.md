---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: vi
kind: article
title: "Mở nguồn Folkbench Pelican Database: Một trong những cơ sở dữ liệu bồ nông chuẩn models.dev lớn và đầy đủ nhất thế giới"
description: "Folkbench phát hành mã nguồn mở Pelican Database: 507 mô hình chuẩn hóa từ 68 nhà cung cấp lọc từ 3.875 mẫu đa nguồn, gồm 454 SVG gốc, 507 PNG chuẩn hóa, đồng bộ models.dev và cập nhật tự động hằng ngày."
category: Đánh giá
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Kho mã nguồn mở Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, kho lưu trữ thẻ pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Kho thử nghiệm gốc simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Kho lưu trữ bồ nông đa ngôn ngữ cập nhật hằng ngày UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: API công khai mã định danh và siêu dữ liệu models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/vi/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Khi bức vẽ con bồ nông đi xe đạp không còn là ảnh chụp màn hình rời rạc trên mạng xã hội mà trở thành kho chuẩn đối chiếu có thể truy vấn và tự động cập nhật hằng ngày cho 507 mô hình, một bài kiểm tra lan truyền đã biến thành hạ tầng kỹ thuật thực thụ để xác minh tính xác thực của LLM.

Hôm nay, chúng tôi chính thức mở nguồn **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** — một trong những cơ sở dữ liệu SVG và PNG **"pelican riding a bicycle"** có cấu trúc lớn nhất và đầy đủ nhất thế giới.

Từ tháng 10 năm 2024 khi Simon Willison phổ biến câu lệnh *"Generate an SVG of a pelican riding a bicycle"*, hàng trăm mô hình đóng và trọng số mở đã được thử nghiệm. Tuy nhiên, dữ liệu bị phân tán trên blog, X, GitHub Gist và các thư viện ảnh, với tên gọi thiếu thống nhất và nhiều mục chỉ còn ảnh chụp màn hình không có mã SVG gốc.

`Folkbench/pelican-database` tổng hợp, làm sạch và chuẩn hóa toàn bộ nguồn dữ liệu theo định danh **[models.dev](https://models.dev)**, tự động đồng bộ hằng ngày qua GitHub Actions để vận hành hệ thống phát hiện tính xác thực mô hình của [Folkbench](https://folkbench.com/vi).

---

## 1. Con số thực tế: Vì sao đây là một trong những kho bồ nông hoàn thiện nhất

Tại bản phát hành công khai đầu tiên (2026-11-22), `Folkbench/pelican-database` bao gồm:

| Tiêu chí | Số liệu xác thực | Chi tiết |
| --- | --- | --- |
| **Tổng mẫu ứng viên tổng hợp** | **3.875** | Kết hợp UncleK/pelicanmap + toàn bộ 161 bài viết, lưới HTML tĩnh và SVG trực tiếp của Simon Willison |
| **Mô hình chuẩn hóa duy nhất** | **507** | Khử trùng lặp từ **799** tên gốc sang khóa `provider/model_id` |
| **Nhà cung cấp bao phủ** | **68** | Từ các phòng lab tiên phong đến các họ mô hình open-weight toàn cầu |
| **Tỷ lệ có mã `.svg` gốc** | **454 (89,5%)** | Mã nguồn SVG đã kiểm chứng cú pháp, không chỉ là ảnh chụp |
| **Ảnh `.png` chuẩn hóa** | **507 (100%)** | Render đồng nhất 1024px nền trắng bằng trình duyệt headless (0 thiếu) |
| **Khớp chính xác `models.dev`** | **378 (74,6%)** | Gồm 190 nhà cung cấp gốc; 129 mô hình cũ hơn tuân theo cùng quy ước |
| **Có mẫu kiểm thử Simon Willison** | **177** | Gắn cờ `tested_by_simon` và ưu tiên nâng cấp lên `.svg` gốc |
| **Khung thời gian** | **2024-10-25 đến 2026-11-21** | Hơn hai năm tiến hóa năng lực tư duy không gian và sinh mã SVG |

![Tiến hóa SVG thực tế giữa mốc 2024 và các mô hình tiên phong 2026 trong Folkbench Pelican Database của OpenAI, Anthropic và Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Hình 1: Sáu tệp `.svg` gốc được render trực tiếp từ `Folkbench/pelican-database`. Hàng trên (tháng 10/2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, `google/gemini-1.5-pro-001`. Hàng dưới (tháng 11/2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`.*

---

## 2. Năm quyết định kỹ thuật cốt lõi

![Hình 2: Kiến trúc thu thập đa nguồn, chuẩn hóa models.dev, render tăng dần SHA-256 và đồng bộ hằng ngày của Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Khôi phục SVG gốc đa nguồn**: kết hợp [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] và [161 bài viết của Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], giải mã 180 SVG base64 từ bảng so sánh HTML trên `static.simonwillison.net` theo thứ tự ưu tiên tất định (**`.svg` thật > bài thử của Simon > prompt classic > mức suy luận mặc định/cao**).
2. **Đồng bộ `models.dev` và quy về phòng lab gốc**: chuẩn hóa 799 bí danh qua [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] về 68 nhà cung cấp (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16...) và lưu đầy đủ bảng `model_aliases`.
3. **Render trình duyệt headless đồng nhất**: pipeline đa nền tảng Chromium/Edge CDP render SVG trong sandbox `<img>` biệt lập ở độ rộng 1024px, kiểm tra header và kích thước của cả 507 tệp PNG.
4. **Sẵn sàng dùng ngay với Tệp, JSON & SQLite**: `models/<provider>/<model_id>.{svg,png}`, `catalog.json` và `pelicans.sqlite` (4 bảng + 2 view).
5. **Tự động đồng bộ tăng dần hằng ngày**: `scripts/sync.py` và `.github/workflows/auto-sync.yml` chạy lúc `09:00 UTC` mỗi ngày, đối chiếu SHA-256 để chỉ render lại các mẫu mới hoặc thay đổi.

---

## 3. Nền tảng đối chiếu cho kiểm tra tính xác thực mô hình của Folkbench

Như đã phân tích trong [Chấm điểm một con bồ nông đi xe đạp như thế nào?](/vi/blog/how-to-score-a-cycling-pelican/) và [Ra mắt hệ thống phát hiện giảm trí Folkbench](/vi/blog/how-folkbench-detects-model-degradation/), việc trạm trung chuyển API âm thầm tráo mô hình rẻ hơn hoặc cắt giảm mức suy luận không thể bị phát hiện bằng kiểm tra HTTP 200 đơn thuần. `Folkbench/pelican-database` đóng vai trò **cơ sở tham chiếu trực quan mở và có thể kiểm chứng**, bổ trợ cho các đầu dò thời sự, dấu vân tay mô hình và mốc API chính hãng độc lập trên [Folkbench Integrity Monitor](https://folkbench.com/vi/arena)[^folkbench-arena].

---

## 4. Bắt đầu nhanh

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

```sql
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;
```

---

## 5. Giấy phép & Lời cảm ơn (Credits & Acknowledgements)

Chúng tôi xin gửi lời cảm ơn chân thành đến **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], cùng **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** và toàn thể cộng đồng đóng góp. Script, lược đồ dữ liệu và tài liệu gốc áp dụng **MIT License**; bản quyền các mẫu SVG/PNG và siêu dữ liệu gốc vẫn thuộc về tác giả ban đầu (xem `NOTICE.md`). Khám phá kho mã tại **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].

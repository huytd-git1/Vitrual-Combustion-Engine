# Mô Phỏng Động Cơ Đốt Trong 4 Kỳ (4-Stroke ICE Simulator)

Ứng dụng web tương tác trực quan phục vụ giảng dạy và nghiên cứu nguyên lý hoạt động của **Động cơ đốt trong 4 kỳ (Four-Stroke Internal Combustion Engine)**.

Toàn bộ mô phỏng chạy 100% trên trình duyệt (client-side), không cần backend hay tài khoản.

🔗 **Link GitHub Pages**: [https://huytd-git1.github.io/Vitrual-Combustion-Engine/](https://huytd-git1.github.io/Vitrual-Combustion-Engine/)

---

## Tính năng chính

### 1. Cơ cấu động cơ 2D chuyển động chính xác
- **Động học chuẩn xác**: Tính toán tọa độ và hành trình piston theo cơ cấu thanh truyền – trục khuỷu thực tế:
  $$x(\theta) = r(1 - \cos\theta) + L - \sqrt{L^2 - r^2\sin^2\theta}$$
- **Chi tiết cơ khí**: Xi lanh, buồng cháy, piston với các rãnh xéc-măng, chốt piston, thanh truyền chữ I, trục khuỷu có má khuỷu đối trọng.
- **Xupáp & Trục cam**: Xupáp nạp và xupáp thải nâng hạ êm dịu theo quy luật cosine; tốc độ trục cam bằng 1/2 trục khuỷu.
- **Tia lửa điện bugi**: Phát tia lửa điện sinh động tại thời điểm đánh lửa sớm trước ĐCT.
- **Màu sắc & Dòng khí**: Màu khí trong xi lanh đổi động theo từng kỳ (Nạp xanh lam, Nén vàng cam, Cháy đỏ rực, Thải tím xám); mũi tên minh họa dòng khí nạp/thải.
- **Tùy chọn hiển thị**: Bật/tắt nhãn tên chi tiết, vạch ĐCT/ĐCD, thước đo hành trình $S$, vệt quỹ đạo chốt khuỷu.

### 2. Đồ thị công p–V hai chế độ
- **Chu trình Otto lý tưởng**:
  - $1 \to 2$: Nén đoạn nhiệt ($s = \text{const}$)
  - $2 \to 3$: Cấp nhiệt đẳng tích tại $V_c$ ($v = \text{const}$)
  - $3 \to 4$: Giãn nở đoạn nhiệt ($s = \text{const}$)
  - $4 \to 1$: Thải nhiệt đẳng tích tại $V_{max}$ ($v = \text{const}$)
  - Tính hiệu suất nhiệt lý tưởng: $\eta = 1 - 1/\varepsilon^{\gamma-1}$
- **Chu trình 4 kỳ gần thực tế**:
  - Xét tổn thất áp suất nạp/thải theo RPM.
  - Quá trình cháy hữu hạn theo hàm Wiebe từ góc đánh lửa sớm.
  - Xả sớm (blowdown) khi xupáp thải mở trước ĐCD.
  - Vòng công bơm (pumping loop).
  - Phản ánh đúng hiệu ứng đánh lửa sớm (đánh lửa quá sớm làm giảm công suất hữu ích).
- Điểm làm việc di chuyển tức thời theo góc trục khuỷu, hỗ trợ phóng to/thu nhỏ, tooltip và xuất ảnh PNG.

### 3. Đồ thị tròn phối khí 720° (Hai vòng đồng tâm)
- Tránh chồng chéo bằng cách biểu diễn **hai vòng quay đồng tâm**:
  - Vòng ngoài (0° – 360°): Kỳ Nạp (0–180°) & Kỳ Nén (180–360°).
  - Vòng trong (360° – 720°): Kỳ Cháy – giãn nở (360–540°) & Kỳ Thải (540–720°).
- Cung mở xupáp nạp: $720^\circ - \alpha$ đến $180^\circ + \beta$ (Thời gian mở: $180^\circ + \alpha + \beta$).
- Cung mở xupáp thải: $540^\circ - \gamma_e$ đến $\delta$ (Thời gian mở: $180^\circ + \gamma_e + \delta$).
- Vùng **trùng điệp xupáp**: $\alpha + \delta$ phát quang nổi bật xung quanh ĐCT.
- Bảng sự kiện phối khí chi tiết: Sự kiện, Vị trí tương đối và Góc trục khuỷu.

### 4. Chế độ học tập & Giảng dạy sư phạm
- **Chế độ quan sát**: Chạy liên tục, tua chậm từ 0.05x đến 1.0x, kéo thanh góc tự do.
- **Chế độ từng kỳ**: Chọn Nạp, Nén, Cháy, Thải để xem phân tích:
  - Hướng chuyển động của piston.
  - Trạng thái đóng/mở của xupáp.
  - Chiều dòng khí lưu thông.
  - Biến đổi áp suất $p$ và thể tích $V$.
  - Chiều trao đổi công cơ học (piston nhận công hay sinh công).
- **Phối khí lý thuyết**: Một chạm đặt $\alpha = \beta = \gamma_e = \delta = 0^\circ$ để so sánh phối khí lý thuyết 180° đối xứng với phối khí thực tế.

### 5. Bảng điều chỉnh tham số toàn diện
- **Hình học**: $D$ (50–120 mm), $S$ (40–120 mm), $L$ (80–250 mm), $\varepsilon$ (6–14). Tự tính $r, A, V_s, V_c, V(\theta)$.
- **Vận hành & Nhiệt động**: $N$ (300–6000 rpm), $p_{in}$ (0.5–1.2 bar), $p_{ex}$ (0.9–1.5 bar), $T_{in}$ (280–350 K), $\gamma$ (1.25–1.40), $q_{in}$ (500–2000 kJ/kg).
- **Phối khí**: $\alpha$ (0–40°), $\beta$ (0–80°), $\gamma_e$ (0–80°), $\delta$ (0–40°).
- **Đánh lửa**: Góc đánh lửa sớm (0–40°), thời gian cháy $\Delta\theta_b$ (20–60°).

### 6. Kết quả tính toán & Xuất dữ liệu
- Tính toán: Công chu trình $W = \oint p\, dV$, Áp suất chỉ thị trung bình $\text{IMEP} = W / V_s$, Công suất chỉ thị $P_i = W \cdot N / 120$ (kW & HP), Hiệu suất nhiệt.
- Phân biệt rõ công suất chỉ thị $P_i$ với công suất có ích tại trục $P_e$.
- Nút **Xuất CSV** tải toàn bộ 721 điểm dữ liệu chu trình.
- Nút **Xuất PNG** tải ảnh đồ thị p–V.
- Bảng tra cứu công thức KaTeX.
- Chế độ Sáng / Tối (Dark mode).

---

## Cài đặt và chạy cục bộ

Yêu cầu: [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

```bash
# 1. Clone repository
git clone https://github.com/huytd-git1/Vitrual-Combustion-Engine.git
cd Vitrual-Combustion-Engine

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy môi trường phát triển (Local dev server)
npm run dev

# 4. Đóng gói cho môi trường production
npm run build
```

Mở trình duyệt tại địa chỉ: `http://localhost:5173/`

---

## Cấu hình GitHub Pages

Dự án đã được tích hợp sẵn GitHub Actions workflow tại `.github/workflows/deploy.yml`.

Để kích hoạt GitHub Pages trên repository:
1. Truy cập vào GitHub repo: `https://github.com/huytd-git1/Vitrual-Combustion-Engine`
2. Vào **Settings** $\rightarrow$ **Pages** (cột bên trái).
3. Tại mục **Build and deployment** $\rightarrow$ **Source**, chọn: **GitHub Actions**.
4. Workflow sẽ tự động build và xuất bản trang web lên:
   👉 **`https://huytd-git1.github.io/Vitrual-Combustion-Engine/`**

---

## Công nghệ sử dụng
- [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [KaTeX](https://katex.org/) (Hiển thị công thức toán)
- [Lucide Icons](https://lucide.dev/)

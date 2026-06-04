# Giải pháp cập nhật tự động số lượng (Count Bubbles) trong UserList

Theo yêu cầu, dưới đây là chi tiết **Giải pháp "Lifting State Up" (Đưa State lên Component Cha)** để tự động cập nhật số lượng ảnh và comment trong `UserList` ngay khi có thay đổi.

## Tổng quan Giải pháp
Trong React, khi hai component anh em (`UserList` và `TopBar`/`UserPhotos`) cần giao tiếp với nhau, ta sẽ đẩy một `state` lên component cha chung của chúng (ở đây là `App.js`).
1. `App.js` sẽ giữ một state đóng vai trò làm "cò súng" (ví dụ: `updateUserListTrigger`).
2. `App.js` truyền state này xuống cho `UserList` dưới dạng props. `UserList` sẽ lắng nghe sự thay đổi của props này (thông qua `useEffect`) để gọi lại API.
3. `App.js` truyền hàm `triggerUserListUpdate` xuống cho `TopBar` (nơi upload ảnh) và `UserPhotos` (nơi đăng comment). Khi người dùng thao tác xong, các component này sẽ gọi hàm đó để thay đổi state ở `App.js`, qua đó kích hoạt `UserList` render lại.

---

## Chi tiết các bước thực hiện

### Bước 1: Khai báo State ở `App.js`
Mở file `Front-end/src/App.js`, khai báo thêm một state mới để trigger update và một hàm để tăng giá trị trigger:

```javascript
import React, { useState, useEffect } from "react";
// ... các import khác

const App = (props) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  // ... các state khác

  // THÊM VÀO ĐÂY: State trigger để làm mới UserList
  const [updateUserListTrigger, setUpdateUserListTrigger] = useState(0);

  // THÊM VÀO ĐÂY: Hàm gọi để kích hoạt update
  const triggerUserListUpdate = () => {
    setUpdateUserListTrigger((prev) => prev + 1);
  };

  // ...
```

### Bước 2: Truyền hàm trigger xuống các nơi thêm Ảnh/Comment
Vẫn trong file `App.js`, tìm đến thẻ `<TopBar>` và truyền hàm `triggerUserListUpdate` vào:

```javascript
<TopBar 
  loggedInUser={loggedInUser} 
  setLoggedInUser={setLoggedInUser} 
  advancedFeatures={advancedFeatures}
  setAdvancedFeatures={setAdvancedFeatures}
  // THÊM DÒNG NÀY:
  triggerUserListUpdate={triggerUserListUpdate} 
/>
```

Tiếp theo, kéo xuống phần `<Routes>`, tìm đến các route gọi `UserPhotos` (hoặc component nào bạn xử lý đăng comment) và truyền hàm đó xuống tương tự:

```javascript
<Route 
  path="/photos/:userId" 
  element={<UserPhotos advancedFeatures={advancedFeatures} triggerUserListUpdate={triggerUserListUpdate} />} 
/>
<Route 
  path="/photos/:userId/:photoId" 
  element={<UserPhotos advancedFeatures={advancedFeatures} triggerUserListUpdate={triggerUserListUpdate} />} 
/>
```

### Bước 3: Gọi hàm trigger sau khi Upload/Comment thành công
Mở component `TopBar` (`Front-end/src/components/TopBar/index.jsx`), trong hàm xử lý upload ảnh thành công, gọi props trigger:

```javascript
const handleUploadPhoto = async (e) => {
  // Logic upload ảnh của bạn ...
  // await axios.post("/photos/new", ...);

  // THÊM CODE NÀY SAU KHI UPLOAD THÀNH CÔNG:
  if (props.triggerUserListUpdate) {
    props.triggerUserListUpdate();
  }
};
```

Tương tự, trong component `UserPhotos` (`Front-end/src/components/UserPhotos/index.jsx`), nơi xử lý đăng comment:

```javascript
const handleAddComment = async (photoId, text) => {
  // Logic đăng comment của bạn ...
  // await axios.post(`/commentsOfPhoto/${photoId}`, { comment: text });

  // THÊM CODE NÀY SAU KHI ĐĂNG COMMENT THÀNH CÔNG:
  if (props.triggerUserListUpdate) {
    props.triggerUserListUpdate();
  }
};
```

### Bước 4: Lắng nghe sự thay đổi trong `UserList`
Mở component `App.js`, cập nhật dòng gọi `UserList` để truyền state `updateUserListTrigger` xuống:

```javascript
<Paper className="main-grid-item">
  {/* Truyền thêm prop updateUserListTrigger */}
  {loggedInUser ? <UserList updateUserListTrigger={updateUserListTrigger} /> : null}
</Paper>
```

Sau đó, mở `Front-end/src/components/UserList/index.jsx`. Đưa biến prop `updateUserListTrigger` vào danh sách phụ thuộc (dependency array) của `useEffect`. Nhờ đó, mỗi khi giá trị này thay đổi (tăng lên 1), React sẽ tự động chạy lại hàm `fetchUsers`.

```javascript
function UserList(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
        const response = await fetchModel("/user/list");
        setUsers(response.data || response); 
    } catch (error) {
        console.error("Lỗi khi lấy danh sách user", error);
    }
  };

  useEffect(() => {
    // Hàm fetchUsers sẽ được gọi lại tự động mỗi khi props.updateUserListTrigger thay đổi
    fetchUsers();
  }, [props.updateUserListTrigger]); // <-- CỰC KỲ QUAN TRỌNG: Thêm prop vào đây

  // ... render bong bóng xanh đỏ
}
```

---

## Tóm tắt
Phương pháp "Lifting State Up" này là phương pháp **"Chuẩn React"** (React idiomatic). Mọi luồng dữ liệu đều được quản lý bằng Props và State rõ ràng, giúp dễ dàng debug và kiểm soát. Luồng dữ liệu chạy thành một vòng khép kín:
*Người dùng tương tác (Con 1) -> Gọi hàm truyền qua Props (Con 1) -> Cập nhật State (Cha) -> Render lại truyền State mới qua Props (Con 2) -> fetch data mới (Con 2).*

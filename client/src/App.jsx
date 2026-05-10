import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";
import MainLayout from "./layouts/MainLayout";
import AdminUserBill from "./pages/AdminUserBill";
import ChatWithAdmin from "./pages/ChatWithAdmin";
import ChatWithUser from "./pages/ChatWithUser";
import UpdateUser from "./pages/UpdateUser";
import ForgotPassword from "./pages/ForgotPassword";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes> */}
      {/* Ye uper ke code basic method tha jaha pe navbar alway visible tha ------------ */}

      {/* <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
      /> */}
      {/* Required for toast notifications to appear */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        <Route path="/user/dashboard/:rollno" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/user-details/:rollno" element={<AdminUserDetails />} />
        <Route path="/admin/user/:rollno" element={<AdminUserBill />} />
        <Route path="/edit-profile" element={<UpdateUser />} />
        <Route path="/chat/admin" element={<ChatWithAdmin />} />
        <Route path="/admin/chat/:userId" element={<ChatWithUser />} />
        <Route path="/reset/password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );   // /admin/chat/${user._id}
}

export default App;

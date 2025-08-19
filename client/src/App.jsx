import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Nav, Container } from 'react-bootstrap';
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import EmailSendOtp from "./pages/EmailSendOtp";
import OtpVerify from "./pages/OtpVerify";
import ForgetOtpVerify from "./pages/ForgetOtpVerify";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./home/Dashboard";
import Item from "./items/Item";
import History from "./History/History";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/registerPage" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/forgetPassword" element={<ForgetPassword />} />
          <Route path="regestation/email/otp-verify" element={<OtpVerify/>} />
          <Route path="/register" element={<EmailSendOtp/>} />
          <Route path="/forget/otp/verify" element={<ForgetOtpVerify/>} />
          <Route path="/new/password" element={<ResetPassword/>}/>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/item" element={<Item/>}/>
          <Route path="/history" element={<History/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

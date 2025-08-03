import '../css/login.css';
import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { validation } from '../js/validation';
import { useNavigate } from 'react-router-dom';
import { HandleLogin } from '../js/logindata';
import UserContext from "../js/userContext";

const Login = () => {
    const { setUser, setEmployeeNumber, setUserData } = useContext(UserContext);
    const navigate = useNavigate();

    const [adminId, setAdminId] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [adminCode, setAdminCode] = useState("");

    const [userId, setUserId] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const [role, setRole] = useState("admin");
    const [errors, setErrors] = useState({
        idError: "",
        passwordError: "",
        admin_codeError: ""
    });

    const [adminLoginError, setAdminLoginError] = useState("");
    const [userLoginError, setUserLoginError] = useState("");
    const [fade_out, setFadeOut] = useState(false);

    const validation_Patterns = {
        admin_Id: /^[A-Za-z0-9]{4,16}$/,
        admin_Password: /^[A-Za-z0-9]{4,14}$/,
        admin_Otp: /^\d{6}$/,
        user_Id: /^[A-Za-z0-9]{4,16}$/,
        user_Pw: /^[A-Za-z0-9]{4,14}$/
    };

    const handlecheck = async (e) => {
        e.preventDefault();

        setAdminLoginError("");
        setUserLoginError("");

        const currentId = role === "admin" ? adminId : userId;
        const setId = role === "admin" ? setAdminId : setUserId;
        const currentPassword = role === "admin" ? adminPassword : userPassword;
        const setPassword = role === "admin" ? setAdminPassword : setUserPassword;

        const isValid = await validation({
            id: currentId,
            setId,
            password: currentPassword,
            setPassword,
            admin_code: adminCode,
            setadmin_code: setAdminCode,
            role,
            validation_Patterns,
            setErrors
        });

        if (isValid.success) {
            const loginsuccess = await HandleLogin(currentId, currentPassword, isValid.dataType, adminCode);

            if (loginsuccess.success === "admin") {
                setFadeOut(true);
                setUser("admin");
                setUserData(loginsuccess.user_Data);
                sessionStorage.setItem("userRole", "admin");
                sessionStorage.setItem("userData", JSON.stringify(loginsuccess.user_Data));
                setTimeout(() => navigate('/adminPage'), 500);
            } else if (loginsuccess.success === "user") {
                setFadeOut(true);
                setUser(loginsuccess.name);
                setEmployeeNumber(loginsuccess.employee_number);
                sessionStorage.setItem("userRole", "user");
                sessionStorage.setItem("userName", loginsuccess.name);
                sessionStorage.setItem("employeeNumber", loginsuccess.employee_number);
                setTimeout(() => navigate('/data'), 500);
            } else {
                if (role === "admin") {
                    setAdminLoginError("아이디 및 비밀번호, 인증코드가 틀렸습니다.");
                } else {
                    setUserLoginError("아이디 및 비밀번호가 틀렸습니다.");
                }
            }
        }

        setAdminId("");
        setAdminPassword("");
        setAdminCode("");
        setUserId("");
        setUserPassword("");
    };

    return (
        <form className={`loginBK ${fade_out ? 'fade-out' : ''}`} onSubmit={handlecheck}>
            <div className="userchoice">
                <div className="userchoice_sub">
                    <motion.div
                        className="activeBackground"
                        animate={{ x: role === "admin" ? "0%" : "100%" }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    />
                    <motion.button
                        type="button"
                        className="Administrator"
                        onClick={() => setRole("admin")}
                        animate={{ color: role === "admin" ? "#fff" : "#333" }}
                        whileTap={{ scale: 0.9 }}
                    >
                        관리자
                    </motion.button>
                    <motion.button
                        type="button"
                        className="user"
                        onClick={() => setRole("user")}
                        animate={{ color: role === "user" ? "#fff" : "#333" }}
                        whileTap={{ scale: 0.9 }}
                    >
                        사원
                    </motion.button>
                </div>
            </div>

            {/* 관리자 로그인 */}
            <motion.div
                className="Admin-register"
                initial={{ opacity: 0, x: -20 }}
                animate={role === "admin" ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ display: role === "admin" ? "flex" : "none" }}
            >
                <h1>관리자</h1>
                <div className="admin_subbox">
                    <input
                        type="text"
                        id="admin_Id"
                        className="id"
                        placeholder="아이디"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    <span className="error">{errors.idError}</span>
                </div>
                <div className="admin_subbox">
                    <input
                        type="password"
                        id="admin_Password"
                        className="password"
                        placeholder="비밀번호"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    <span className="error">{errors.passwordError}</span>
                </div>
                <div className="admin_subbox">
                    <input
                    type="password"
                    id="admin_Otp"
                    className="otp"
                    placeholder="인증코드"
                    value={adminCode}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                        setAdminCode(value);
                        }
                    }}
                    onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    maxLength={6}
                    autoComplete="off"
                    name="no-autocomplete-admin-otp"
                    />
                    <span className="error">{errors.admin_codeError}</span>
                </div>
                <div className="check_message" style={{ display: adminLoginError ? 'flex' : 'none' }}>
                    <span className="tooltip" style={{ color: 'red' }}>{adminLoginError}</span>
                </div>
            </motion.div>

            {/* 사원 로그인 */}
            <motion.div
                className="user-register"
                initial={{ opacity: 0, x: 20 }}
                animate={role === "user" ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ display: role === "user" ? "flex" : "none" }}
            >
                <h1>사원</h1>
                <div className="user_subbox">
                    <input
                        type="text"
                        id="user_Id"
                        className="id"
                        placeholder="아이디"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    <span className="error">{errors.idError}</span>
                </div>
                <div className="user_subbox">
                    <input
                        type="password"
                        id="user_Pw"
                        className="password"
                        placeholder="비밀번호"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    />
                    <span className="error">{errors.passwordError}</span>
                </div>
                <div className="check_message" style={{ display: userLoginError ? 'flex' : 'none' }}>
                    <span className="tooltip" style={{ color: 'red' }}>{userLoginError}</span>
                </div>
            </motion.div>

            <button className="answerBtn" type="submit">로그인</button>
        </form>
    );
};

export default Login;

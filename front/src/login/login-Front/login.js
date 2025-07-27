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
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [admin_code, setadmin_code] = useState("");
    const [role, setRole] = useState("admin");
    const [errors, setErrors] = useState({
        idError: "",
        passwordError: "",
        admin_codeError: ""
    });
    const [login_check_message, setlogin_check_message] = useState("");
    const [fade_out, setfade_out] = useState(false);

    const validation_Patterns = {
        admin_Id: /^[A-Za-z0-9]{4,16}$/,
        admin_Password: /^[A-Za-z0-9]{4,14}$/,
        admin_Otp: /^\d{6}$/,  // 숫자 6자리
        user_Id: /^[A-Za-z0-9]{4,16}$/,
        user_Pw: /^[A-Za-z0-9]{4,14}$/
    };

    const handle_Change = (e) => {
        const { id, value } = e.target;
        switch (id) {
            case "admin_Id":
            case "user_Id":
                setId(value);
                break;
            case "admin_Password":
            case "user_Pw":
                setPassword(value);
                break;
            case "admin_Otp":
                if (/^\d*$/.test(value)) { // 숫자만 입력 허용
                    setadmin_code(value);
                }
                break;
            default:
                console.log("값이 입력되지 않음");
        }
    };

    const handlecheck = async (e) => {
        e.preventDefault();

        const isValid = await validation({
            id,
            setId,
            password,
            setPassword,
            admin_code,
            setadmin_code,
            role,
            validation_Patterns,
            setErrors
        });

        if (isValid.success) {
            const loginsuccess = await HandleLogin(id, password, isValid.dataType, admin_code);

            if (loginsuccess.success === "admin") {
                setfade_out(true);
                setUser("admin");
                setUserData(loginsuccess.user_Data)
                sessionStorage.setItem("userRole", "admin");
                sessionStorage.setItem("userData", JSON.stringify(loginsuccess.user_Data));
                setTimeout(() => {
                    navigate('/adminPage');
                }, 500);
            } else if (loginsuccess.success === "user") {
                setfade_out(true);
                setUser(loginsuccess.name);
                setEmployeeNumber(loginsuccess.employee_number);
                sessionStorage.setItem("userRole", "user");
                sessionStorage.setItem("userName", loginsuccess.name);
                sessionStorage.setItem("employeeNumber", loginsuccess.employee_number);

                setTimeout(() => {
                    navigate('/data');
                }, 500);
            } else {
                setlogin_check_message("아이디 및 비밀번호, 인증코드가 틀렸습니다.");
            }
        }

        setId("");
        setPassword("");
        setadmin_code("");
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
                        value={id}
                        onChange={handle_Change}
                    />
                    <span className="error">{errors.idError}</span>
                </div>
                <div className="admin_subbox">
                    <input
                        type="password"
                        id="admin_Password"
                        className="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={handle_Change}
                    />
                    <span className="error">{errors.passwordError}</span>
                </div>
                <div className="admin_subbox">
                    <input
                        type="text"
                        id="admin_Otp"
                        className="otp"
                        placeholder="인증코드 (6자리 숫자)"
                        value={admin_code}
                        onChange={handle_Change}
                        maxLength={6}
                    />
                    <span className="error">{errors.admin_codeError}</span>
                </div>
                <div className="check_message" style={{ display: login_check_message ? 'flex' : 'none' }}>
                    <span className="tooltip" style={{ color: 'red' }}>{login_check_message}</span>
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
                        value={id}
                        onChange={handle_Change}
                    />
                    <span className="error">{errors.idError}</span>
                </div>
                <div className="user_subbox">
                    <input
                        type="password"
                        id="user_Pw"
                        className="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={handle_Change}
                    />
                    <span className="error">{errors.passwordError}</span>
                </div>
                <div className="check_message" style={{ display: login_check_message ? 'flex' : 'none' }}>
                    <span className="tooltip" style={{ color: 'red' }}>{login_check_message}</span>
                </div>
            </motion.div>

            <button className="answerBtn" type="submit">로그인</button>
        </form>
    );
};

export default Login;



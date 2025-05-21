import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Imagen from "../imagenes/logo proyecto color.jpeg";
import styles from "../styles/LoginPage.module.css"; 

const Login = () => {
  const navigate = useNavigate();
  const [usuario, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/login", {
        usuario,
        password,
      });
      if (response.status === 200) {
        const { nombre, usuario, rol, usuario_id } = response.data;
        localStorage.setItem("id_usuario", usuario_id );
        localStorage.setItem("nombre", nombre);
        console.log(nombre);
        localStorage.setItem("usuario", usuario);
        localStorage.setItem("rol", rol);
        console.log(rol);

        if (rol === "usuario") {
          navigate("/home");
        } else if (rol === "administrador") {
          navigate("/Superadmin");
        } else if (rol === "tecnico") {
          navigate ("/HomeAdmiPage")
        }else {
          alert("Sin rol para ingresar");
          window.location.reload();
        }
      }
      setMessage(response.data.mensaje);
    } catch (error) {
      setMessage(error.response?.data?.error || "Usuario o Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  return (
   
    <div className={styles.Login}> {/* Usar clases del módulo */}
      <header>
        <img src={Imagen} alt="Logo" className={styles.empresarial} />
        <h1>BIENVENIDOS A HELP DESK JCDB</h1>
      </header>

      <div className={styles.row}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
           
            <input
              className={styles.inicio} // Aplicar la clase .inicio
              type="text"
              placeholder="USUARIO"
              value={usuario}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
          
            <input
              className={styles.inicio} // Aplicar la clase .inicio
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className={styles.buttonLogin}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Cargando..." : "Aceptar"}
            </button>
          </div>
        </form>

        {message && <p className={styles.mensaje}>{message}</p>}
      </div>
      <p>Transformando la atención al cliente con inteligencia y eficiencia.</p>
    </div>
  
  );
};

export default Login;
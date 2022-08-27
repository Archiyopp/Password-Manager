import { LoginTwoTone } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userLogin, load } from "../services";
import { useAuthContext } from "../contexts/auth";

export function Login() {
  const { auth, setAuth } = useAuthContext();
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userData = new FormData(event.currentTarget);
    const username = userData.get("username");
    const password = userData.get("password");
    if (typeof username !== "string" || typeof password !== "string") {
      toast.error(
        "El usuario o la contraseña no fueron ingresados correctamente"
      );
      return;
    }
    try {
      const user = await userLogin(username, password);
      setAuth({
        ...auth,
        isAuthenticated: true,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
      });
      navigate("/");
    } catch (error) {
      error instanceof Error
        ? toast.error(error.message)
        : toast.error("Error al iniciar sesión");

      console.error(error);
    }
  };
  return (
    <Box
      sx={{
        marginTop: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "360px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ backgroundColor: "secondary.main" }}>
          <LoginTwoTone />
        </Avatar>
        <Typography variant="h5" component="h1">
          Bienvenido
        </Typography>
        <TextField
          id="username"
          label="Usuario"
          name="username"
          autoFocus
          fullWidth
          required
        />
        <TextField
          id="password"
          label="Contraseña"
          name="password"
          type="password"
          fullWidth
          required
        />
        <Button variant="contained" fullWidth type="submit">
          Iniciar sesión
        </Button>
        <Link to="/register">
          <Typography variant="body2">
            {"¿No tienes una cuenta? Regístrate"}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
}

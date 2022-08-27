import { AppRegistration } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthContext } from "../contexts/auth";
import { registerUser } from "../services";
import { useState } from "react";

function validatePassword(password: any) {
  if (typeof password !== "string")
    return "La contraseña no fue ingresada correctamente";
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  } else if (password.toLowerCase() === password) {
    return "La contraseña debe tener al menos una mayúscula";
  } else if (password.toUpperCase() === password) {
    return "La contraseña debe tener al menos una minúscula";
  } else if (!/\d/.test(password)) {
    return "La contraseña debe tener al menos un número";
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "La contraseña debe tener al menos un carácter especial";
  } else {
    return "";
  }
}

export function Register() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuthContext();
  const [passwordError, setPasswordError] = useState("");
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userData = new FormData(event.currentTarget);
    // check is passwords match
    const password = userData.get("password");
    const confirmPassword = userData.get("confirmPassword");
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }
    const username = userData.get("username");
    const email = userData.get("email");
    const first_name = userData.get("firstName");
    const last_name = userData.get("lastName");

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof first_name !== "string" ||
      typeof last_name !== "string" ||
      typeof password !== "string"
    ) {
      toast.error("El formulario no fue llenado correctamente");
      return;
    }
    const userObject = {
      username,
      email,
      first_name,
      last_name,
      password,
    };

    registerUser(userObject)
      .then((res) => {
        toast.success("Usuario registrado correctamente");
        setAuth({
          ...auth,
          isAuthenticated: true,
          username: res.username,
          email: res.email,
          firstName: res.first_name,
          lastName: res.last_name,
        });
        navigate("/");
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Ocurrió un error al registrar el usuario");
        }
        console.error(error);
      });
  };

  return (
    <Box
      sx={{
        mt: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mb: "1rem",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          width: "360px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ backgroundColor: "secondary.main" }}>
          <AppRegistration />
        </Avatar>
        <Typography variant="h5" component="h1">
          Registro
        </Typography>
        <TextField
          id="username"
          label="Usuario"
          name="username"
          autoFocus
          fullWidth
          required
          size="small"
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="name"
              label="Nombres"
              name="firstName"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="lastName"
              label="Apellidos"
              name="lastName"
              size="small"
            />
          </Grid>
        </Grid>

        <TextField
          id="email"
          label="Email"
          name="email"
          fullWidth
          autoComplete="email"
          required
          helperText="Ejemplo: hello.world@gmail.com"
          inputProps={{
            pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
          }}
          size="small"
        />
        <TextField
          id="password"
          label="Contraseña"
          name="password"
          type="password"
          fullWidth
          required
          size="small"
          error={!!passwordError}
          helperText={passwordError}
          onChange={() => setPasswordError("")}
        />
        <TextField
          id="confirmPassword"
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          fullWidth
          required
          size="small"
        />
        <Button variant="contained" fullWidth type="submit">
          Registrarse
        </Button>
        <Link to="/login">
          <Typography variant="body2">
            {"¿Ya tienes una cuenta? Inicia sesión"}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
}

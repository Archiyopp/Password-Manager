import {
  AppBar,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { Box } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { AuthGuard } from "./components/AuthGuard";
import { useEffect } from "react";
import { getCredentials, load } from "./services";
import { useAuthContext, getInitialAuth } from "./contexts/auth";
import { Language, Logout } from "@mui/icons-material";
import {
  CredentialsProvider,
  useCredentialsContext,
} from "./contexts/credentials";
import { CreateCredential, CredentialView } from "./Pages/Credentials";

const drawerWidth = 240;

function App() {
  const { pathname } = useLocation();
  const { auth, setAuth } = useAuthContext();
  const width =
    pathname === "/login" || pathname === "/register" ? 0 : drawerWidth;
  useEffect(() => {
    load();
  }, []);
  return (
    <main>
      <Container>
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${width}px)`,
            ml: `${width}px`,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap component="h6">
              Administración de contraseñas
            </Typography>
            {auth.isAuthenticated && (
              <Tooltip
                onClick={() => setAuth(getInitialAuth())}
                color="inherit"
                title="Cerrar sesión"
              >
                <IconButton>
                  <Logout />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          >
            <Route index element={<Welcome />} />
            <Route path="credentials/:id" element={<CredentialView />} />
            <Route path="/create" element={<CreateCredential />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
    </main>
  );
}

function Home() {
  return (
    <section>
      <CredentialsProvider>
        <HomeDrawer />
        <Box sx={{ mt: "80px", ml: `${drawerWidth}px` }}>
          <Outlet />
        </Box>
      </CredentialsProvider>
    </section>
  );
}

function HomeDrawer() {
  return (
    <Drawer
      variant="permanent"
      container={window?.document?.body}
      ModalProps={{ keepMounted: true }}
      open
      sx={{
        display: "flex",
        flexDirection: "column",
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: `${drawerWidth}px`,
        },
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ textAlign: "center", my: "4px" }}>
        Credenciales
      </Typography>
      <Divider orientation="horizontal" flexItem />
      <CredentialsList />
      <Box>
        <Divider orientation="horizontal" flexItem />
        <Button fullWidth component={Link} to="create">
          Crear nueva credencial
        </Button>
      </Box>
    </Drawer>
  );
}

function CredentialsList() {
  const { auth } = useAuthContext();
  const { credentials, setCredentials } = useCredentialsContext();
  useEffect(() => {
    if (auth.isAuthenticated) {
      getCredentials(auth.username)
        .then((credentialsArray) => setCredentials(credentialsArray))
        .catch((err) => {
          err instanceof Error
            ? toast.error(err.message)
            : toast.error("Error al obtener las credenciales");
          console.error(err);
        });
    }
  }, [auth]);
  return (
    <List
      sx={{ height: "100vh", overflowY: "auto", overflowX: "auto" }}
      disablePadding
    >
      {credentials.map((cred) => (
        <ListItem key={cred.id} disablePadding>
          <ListItemButton
            component={Link}
            to={`/credentials/${cred.id}`}
            title={cred.url}
            sx={{ py: "4px" }}
          >
            <ListItemIcon>
              <Language />
            </ListItemIcon>
            <ListItemText>
              {cred.name ? cred.name : "Sin nombre"}
              <Typography variant="body2">
                {cred.username ? cred.username : "Sin usuario"}
              </Typography>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

function Welcome() {
  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: "1rem" }}
      >
        Bienvenido
      </Typography>
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{ textAlign: "center" }}
      >
        Elige una credencial o crea una.
      </Typography>
    </Box>
  );
}

export default App;

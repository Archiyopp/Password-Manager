import {
  Typography,
  Box,
  TextField,
  Button,
  Tooltip,
  IconButton,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from "@mui/material";
import { useAuthContext } from "../contexts/auth";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCredential,
  deleteCredential,
  editCredential,
} from "../services";
import { toast } from "react-toastify";
import { useCredentialsContext } from "../contexts/credentials";
import {
  ContentCopy,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useEffect, useReducer, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { clipboard } from "@tauri-apps/api";
import { Credential } from "../models";

export function CredentialView() {
  const { id } = useParams();
  const { credentials, setCredentials } = useCredentialsContext();
  const [isEditing, toggleEdit] = useReducer((st) => !st, false);
  const ref = useRef<HTMLInputElement>();
  const credential = credentials.find(
    (c) => c.id === Number.parseInt(id || "")
  );
  const [username, setUsername] = useState(credential?.username);

  useEffect(() => {
    if (!isEditing) {
      setUsername(credential?.username);
    }
  }, [credential, isEditing]);

  if (!credential) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ textAlign: "center" }}>
          Credencial no encontrada
        </Typography>
      </Box>
    );
  }

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      if (typeof username !== "string" || typeof password !== "string") {
        throw new Error("Nombre de usuario requerido");
      }
      if (!password) {
        throw new Error("Contraseña requerida");
      }
      const editedCredential = {
        ...credential,
        username,
        password,
      };
      const updatedCredential = await editCredential(editedCredential);
      setCredentials(
        credentials.map((c) =>
          c.id === credential?.id ? updatedCredential : c
        )
      );

      toggleEdit();
    } catch (error) {
      error instanceof Error
        ? toast.error(error.message)
        : toast.error("Error al guardar");
    }
  };
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ textAlign: "center", mb: "1rem", mt: "0rem" }}
        >
          {credential.name}
        </Typography>
        <Box>
          <Tooltip
            title="Editar credencial"
            onClick={() => {
              toggleEdit();
              if (ref?.current) {
                ref.current.focus();
              }
            }}
          >
            <IconButton>
              <Edit />
            </IconButton>
          </Tooltip>
          <DeleteCredentialTooltip credential={credential} />
        </Box>
      </Box>
      <Divider sx={{ mb: "2.5rem" }} />
      <Typography variant="subtitle2" component="p">
        Dirección de sitio web
      </Typography>
      <Typography variant="body2" color="primary" mb="2.5rem">
        {credential.url}
      </Typography>
      <Box component="form" onSubmit={saveEdit}>
        <TextField
          id="username"
          name="username"
          label="Usuario"
          sx={{ width: "60%", mb: "1.5rem" }}
          size="small"
          autoFocus
          value={isEditing ? username : credential.username}
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ readOnly: !isEditing, ref }}
        />
        {!isEditing && (
          <Tooltip
            title="Copiar usuario"
            sx={{ ml: "1rem" }}
            onClick={() => {
              clipboard.writeText(credential.username);
              toast.info("Usuario copiado", { autoClose: 1500 });
            }}
          >
            <IconButton>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        )}
        <PasswordCredentialView
          password={credential.password}
          isEditing={isEditing}
        />
        {isEditing && (
          <Stack direction="row" spacing={2} mt="1rem">
            <Button variant="contained" type="submit">
              Guardar cambios
            </Button>
            <Button
              variant="contained"
              color="secondary"
              type="button"
              onClick={toggleEdit}
            >
              Cancelar
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function PasswordCredentialView({
  password,
  isEditing,
}: {
  password: string;
  isEditing: boolean;
}) {
  const [decryptedPassword, setDecryptedPassword] = useState(password);
  const [editedPassword, setEditedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    invoke("decrypt", { encrypted: password }).then((res) => {
      if (typeof res === "string") {
        setDecryptedPassword(res);
        setEditedPassword(res);
      }
    });
  }, [password]);

  useEffect(() => {
    if (!isEditing) {
      setShowPassword(false);
      setEditedPassword(decryptedPassword);
    }
  }, [isEditing]);

  return (
    <>
      <FormControl sx={{ width: "60%" }} variant="outlined" size="small">
        <InputLabel htmlFor="password">Contraseña</InputLabel>
        <OutlinedInput
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          readOnly={!isEditing}
          aria-readonly={!isEditing}
          value={isEditing ? editedPassword : decryptedPassword}
          onChange={({ target }) => {
            isEditing && setEditedPassword(target.value);
          }}
          fullWidth
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Contraseña"
        />
      </FormControl>
      {!isEditing && (
        <Tooltip
          title="Copiar contraseña"
          sx={{ ml: "1rem" }}
          onClick={() => {
            clipboard.writeText(decryptedPassword);
            toast.info("Contraseña copiada", { autoClose: 1500 });
          }}
        >
          <IconButton>
            <ContentCopy />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}

export function CreateCredential() {
  const { credentials, setCredentials } = useCredentialsContext();
  const { auth } = useAuthContext();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const credentialData = new FormData(e.currentTarget);
    const name = credentialData.get("name");
    const url = credentialData.get("url");
    const username = credentialData.get("username");
    const password = credentialData.get("password");
    if (
      typeof name !== "string" ||
      typeof url !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      toast.error("Error al llenar el formulario");
      return;
    }

    createCredential({
      name,
      url,
      username,
      password,
      user_username: auth.username,
    })
      .then((credential) => {
        setCredentials([...credentials, credential]);
        navigate("/credentials/" + credential.id);
        toast.success("Credencial creada");
      })
      .catch((err) => {
        err instanceof Error
          ? toast.error(err.message)
          : toast.error("Error al crear la credencial");
        console.error(err);
      });
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: "3rem" }}
      >
        Crear nueva credencial
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <TextField
          id="name"
          name="name"
          label="Nombre"
          sx={{ width: "80%" }}
          size="small"
        />
        <TextField
          id="url"
          name="url"
          label="Url"
          sx={{ width: "80%" }}
          size="small"
        />
        <TextField
          id="username"
          name="username"
          label="Usuario"
          sx={{ width: "80%" }}
          size="small"
        />
        <TextField
          id="password"
          name="password"
          label="Contraseña"
          sx={{ width: "80%" }}
          type="password"
          required
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ width: "80%" }}
          size="medium"
        >
          Crear
        </Button>
      </Box>
    </Box>
  );
}

function DeleteCredentialTooltip({ credential }: { credential: Credential }) {
  const [show, setShow] = useState(false);
  const { setCredentials } = useCredentialsContext();
  const handleSubmit = () => {
    deleteCredential(credential.id)
      .then(() => {
        setCredentials((credentials) =>
          credentials.filter((c) => c.id !== credential.id)
        );
        toast.success("Credencial eliminada");
        setShow(false);
      })
      .catch((err) => {
        err instanceof Error
          ? toast.error(err.message)
          : toast.error("Error al eliminar la credencial");
        console.error(err);
      });
  };

  return (
    <>
      <Tooltip
        title="Eliminar credencial"
        sx={{ ml: "4px" }}
        onClick={() => setShow(true)}
      >
        <IconButton>
          <Delete />
        </IconButton>
      </Tooltip>
      <DeleteDialog
        onConfirm={handleSubmit}
        show={show}
        handleClose={() => setShow(false)}
      />
    </>
  );
}

function DeleteDialog({
  show,
  handleClose,
  onConfirm,
}: {
  show: boolean;
  handleClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={show}
      onClose={handleClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Eliminar credencial</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Se eliminara la credencial permanentemente.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="info">
          Cancelar
        </Button>
        <Button onClick={onConfirm} autoFocus color="error">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

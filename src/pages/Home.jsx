import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function Home() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newParticipant, setNewParticipant] = useState("");
  const [participants, setParticipants] = useState([]);

  // Detecta usuari loguejat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  // Carregar projectes quan hi ha usuari
  useEffect(() => {
    if (currentUser) fetchProjects();
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "projects"),
        where("authorId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(list);
    } catch (err) {
      console.error("Error carregant projectes:", err);
    }
    setLoading(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addDoc(collection(db, "projects"), {
        title,
        authorId: currentUser.uid,
        participants: [currentUser.email, ...participants],
        createdAt: serverTimestamp()
      });

      setTitle("");
      setParticipants([]);
      setNewParticipant("");
      fetchProjects();
    } catch (err) {
      console.error("Error creant projecte:", err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("¿Segur que vols eliminar aquest projecte?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      fetchProjects();
    } catch (err) {
      console.error("Error eliminant projecte:", err);
    }
  };

  const handleEditProject = async (id) => {
    const newTitle = prompt("Nou títol del projecte:");
    if (!newTitle || !newTitle.trim()) return;

    try {
      await updateDoc(doc(db, "projects", id), { title: newTitle });
      fetchProjects();
    } catch (err) {
      console.error("Error actualitzant projecte:", err);
    }
  };

  if (!currentUser) return <p>Carregant usuari...</p>;
  if (loading) return <p>Carregant projectes...</p>;

  return (
    <div>
      <h1>Projectes</h1>
      <p>Benvingut: {currentUser.email}</p>

      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="Nou projecte"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Afegir participant (email o nom)"
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
        />

        <button
          type="button"
          onClick={() => {
            if (
              newParticipant.trim() &&
              !participants.includes(newParticipant)
            ) {
              setParticipants([...participants, newParticipant.trim()]);
              setNewParticipant("");
            }
          }}
        >
          Afegir participant
        </button>

        <p>Participants afegits: {participants.join(", ") || "Cap"}</p>

        <button type="submit">Crear</button>
      </form>

      {projects.length === 0 ? (
        <p>No tens projectes encara</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <Link to={`/project/${p.id}`}>
                <strong>{p.title}</strong>
              </Link>{" "}
              <button onClick={() => handleEditProject(p.id)}>Editar</button>
              <button onClick={() => handleDeleteProject(p.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
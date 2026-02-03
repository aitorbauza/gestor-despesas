import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc
} from "firebase/firestore";

function ProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // participants
  const [newParticipant, setNewParticipant] = useState("");
  // despeses
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
   );

  const fetchProject = async () => {
    const ref = doc(db, "projects", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setProject({ id: snap.id, ...data });
      setPaidBy(auth.currentUser.email);
      setSplitBetween(data.participants);
    }
  };

  const fetchExpenses = async () => {
    const ref = collection(db, "projects", id, "expenses");
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setExpenses(list);
  };

  useEffect(() => {
    fetchProject();
    fetchExpenses();
  }, []);

  // participants
  const handleAddParticipant = async () => {
    if (!newParticipant.trim()) return;
    if (project.participants.includes(newParticipant)) return;

    await updateDoc(doc(db, "projects", id), {
      participants: [...project.participants, newParticipant.trim()]
    });

    setNewParticipant("");
    fetchProject();
  };

  const handleEditParticipant = async (oldName) => {
    const newName = prompt("Nou nom del participant:", oldName);
    if (!newName || !newName.trim()) return;

    const updated = project.participants.map((p) =>
      p === oldName ? newName.trim() : p
    );

    await updateDoc(doc(db, "projects", id), {
      participants: updated
    });

    fetchProject();
  };

  const handleDeleteParticipant = async (name) => {
    if (!window.confirm("Eliminar participant?")) return;

    const updated = project.participants.filter((p) => p !== name);

    await updateDoc(doc(db, "projects", id), {
      participants: updated
    });

    fetchProject();
  };

  // Despeses
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!concept || !amount || splitBetween.length === 0) return;

    await addDoc(collection(db, "projects", id, "expenses"), {
      concept,
      amount: Number(amount),
      paidBy,
      splitBetween
    });

    setConcept("");
    setAmount("");
    setPaidBy(auth.currentUser.email);
    setSplitBetween(project.participants);

    fetchExpenses();
  };

  const handleEditExpense = async (expense) => {
    const newConcept = prompt("Nou concepte:", expense.concept);
    if (!newConcept) return;

    const newAmount = prompt("Nova quantia:", expense.amount);
    if (!newAmount || isNaN(newAmount)) return;

    await updateDoc(
      doc(db, "projects", id, "expenses", expense.id),
      {
        concept: newConcept,
        amount: Number(newAmount)
      }
    );

    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Eliminar despesa?")) return;

    await deleteDoc(doc(db, "projects", id, "expenses", expenseId));
    fetchExpenses();
  };

  const calculateSummary = () => {
    const summary = {};

    project.participants.forEach((p) => {
        summary[p] = 0;
    });

    expenses.forEach((e) => {
        const share = e.amount / e.splitBetween.length;

        // qui paga
        summary[e.paidBy] += e.amount;

        // qui deu
        e.splitBetween.forEach((p) => {
        summary[p] -= share;
        });
    });

    return summary;
  };

  


  if (!project) return <p>Carregant projecte...</p>;

  return (
    <div>
      <h2>{project.title}</h2>

      {}
      <h3>Participants</h3>
      <ul>
        {project.participants.map((p, i) => (
          <li key={i}>
            {p}
            <button onClick={() => handleEditParticipant(p)}>Editar</button>
            <button onClick={() => handleDeleteParticipant(p)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Nou participant"
        value={newParticipant}
        onChange={(e) => setNewParticipant(e.target.value)}
      />
      <button onClick={handleAddParticipant}>Afegir participant</button>

      {}
      <h3>Afegir despesa</h3>

      <form onSubmit={handleCreateExpense}>
        <input
          type="text"
          placeholder="Concepte"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantia"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Pagat per:</label>
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {project.participants.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>

        <p>Dividir entre:</p>
        {project.participants.map((p, i) => (
          <label key={i} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={splitBetween.includes(p)}
              onChange={() => {
                if (splitBetween.includes(p)) {
                  setSplitBetween(splitBetween.filter((x) => x !== p));
                } else {
                  setSplitBetween([...splitBetween, p]);
                }
              }}
            />
            {p}
          </label>
        ))}

        <button type="submit">Afegir despesa</button>
      </form>

      <h3>Despeses</h3>
      {expenses.length === 0 ? (
        <p>No hi ha despeses</p>
      ) : (
        <ul>
          {expenses.map((e) => (
            <li key={e.id}>
              <strong>{e.concept}</strong> — {e.amount}€  
              <br />
              Pagat per: {e.paidBy}
              <br />
              Dividit entre: {e.splitBetween.join(", ")}
              <br />
              <button onClick={() => handleEditExpense(e)}>Editar</button>
              <button onClick={() => handleDeleteExpense(e.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3>Resum del projecte</h3>
        <p><strong>Total despeses:</strong> {totalExpenses} €</p>
        <ul>
        {Object.entries(calculateSummary()).map(([name, balance]) => (
            <li key={name}>
            {name}:{" "}
            {balance > 0 && `ha de rebre ${balance.toFixed(2)} €`}
            {balance < 0 && `deu ${Math.abs(balance).toFixed(2)} €`}
            {balance === 0 && "està a zero"}
            </li>
        ))}
        </ul>
    </div>
  );
}

export default ProjectDetail;
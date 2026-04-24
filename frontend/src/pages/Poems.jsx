import { useEffect, useState } from "react";
import { getPoems } from "../api/poems";
import PoemCard from "../components/PoemCard";
import Modal from "../components/Modal";

export default function Poems() {
    const [poems, setPoems] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        load("popular");
    }, []);

    const load = async (sort) => {
        const res = await getPoems(sort);
        setPoems(res.data);
    };

    return (
        <div className="container">
            <h2>Poems</h2>

            <button onClick={() => load("popular")}>Popular</button>
            <button onClick={() => load("")}>New</button>

            {poems.map((p) => (
                <PoemCard key={p.id} poem={p} onClick={() => setSelected(p)} />
            ))}

            {selected && (
                <Modal onClose={() => setSelected(null)}>
                    <h2>{selected.title}</h2>
                    <p>{selected.content}</p>
                </Modal>
            )}
        </div>
    );
}
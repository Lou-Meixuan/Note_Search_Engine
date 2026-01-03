import { useState } from "react";
import { Link } from "react-router-dom";


export default function SearchPage() {
    const [q, setQ] = useState("");
    const [scope, setScope] = useState("all");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    async function doSearch() {
        setError("");
        try {
            const res = await fetch(
                `http://localhost:3001/search?q=${encodeURIComponent(q)}&scope=${scope}`
            );
            setData(await res.json());
        } catch (e) {
            setError(String(e));
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Note Search Engine</h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Type query..."
                />
                <select value={scope} onChange={(e) => setScope(e.target.value)}>
                    <option value="local">local</option>
                    <option value="remote">remote</option>
                    <option value="all">all</option>
                </select>
                <button onClick={doSearch}>Search</button>
            </div>

            {error ? <div style={{ color: "red" }}>{error}</div> : null}

            <pre style={{ background: "#f6f6f6", padding: 12 }}>
        {data ? JSON.stringify(data, null, 2) : "No results yet."}
      </pre>
        </div>
    );
}

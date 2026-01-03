import { useParams } from "react-router-dom";

export default function DocumentPage() {
    const { id } = useParams();
    return (
        <div>
            <h2>Document</h2>
            <p>Doc ID: {id}</p>
            <p>Day2 做这里：调用后端 GET /documents/:id 显示全文。</p>
        </div>
    );
}

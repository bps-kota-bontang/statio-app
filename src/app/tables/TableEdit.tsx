import { useParams } from "react-router";

const TableEdit = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h3>Edit Table: {id}</h3>
      <p>Form edit untuk tabel ini.</p>
    </div>
  );
};

export default TableEdit;

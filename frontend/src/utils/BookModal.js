import React from "react";

function BookModal({ isOpen, onClose, onSubmit, book, isEdit }) {
  const [formData, setFormData] = React.useState({
    title: book?.title || "",
    author: book?.author || "",
    year: book?.year || "",
    isbn: book?.isbn || "",
  });

  React.useEffect(() => {
    setFormData({
      title: book?.title || "",
      author: book?.author || "",
      year: book?.year || "",
      isbn: book?.isbn || "",
    });
  }, [book]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{isEdit ? "Edit Book" : "Add New Book"}</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
          <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" required />
          <input name="year" value={formData.year} onChange={handleChange} placeholder="Year" required type="number" />
          <input name="isbn" value={formData.isbn} onChange={handleChange} placeholder="ISBN" required />
          <button type="submit">Save</button>
          <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
  },
  modal: {
    background: "white", padding: 20, borderRadius: 10, maxWidth: "500px", width: "100%"
  },
};

export default BookModal;

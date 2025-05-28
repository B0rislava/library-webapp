import React from "react";

function BookModal({ isOpen, onClose, onSubmit, isEdit, formData, setFormData }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
        ...formData,
        cover_url:
         !formData.cover_url || formData.cover_url.trim() === ""
        ? "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
        : formData.cover_url,
    };
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{isEdit ? "Edit Book" : "Add New Book"}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author"
            required
          />
          <input
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="Year"
            required
            type="number"
          />
          <input
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="ISBN"
            required
          />
          <input
            name="cover_url"
            value={formData.cover_url || ""}
            onChange={handleChange}
            placeholder="Cover URL"
          />
          <input
            name="pdf_url"
            value={formData.pdf_url || ""}
            onChange={handleChange}
            placeholder="PDF URL"
          />

          <div style={styles.buttons}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    maxWidth: "500px",
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};

export default BookModal;

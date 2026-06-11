import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {

  const [products, setProducts] = useState([
    { id: 1, name: "Rice", stock: 10 },
    { id: 2, name: "Sugar", stock: 5 },
    { id: 3, name: "Oil", stock: 2 },
  ]);

  // ADD PRODUCT
 const addProduct = (name, stock) => {

  setProducts((prev) => {

    const existing = prev.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      // update stock if product already exists
      return prev.map((p) =>
        p.name.toLowerCase() === name.toLowerCase()
          ? { ...p, stock: p.stock + Number(stock) }
          : p
      );
    }

    // add new product
    return [
      ...prev,
      {
        id: Date.now(),
        name,
        stock: Number(stock),
      },
    ];

  });

};

  // DELETE PRODUCT
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // UPDATE STOCK
  const updateStock = (id, newStock) => {

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: newStock }
          : item
      )
    );

  };

  // REDUCE STOCK (ORDER)
  const reduceStock = (id, qty) => {

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: item.stock - qty }
          : item
      )
    );

  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        updateStock,
        reduceStock
      }}
    >
      {children}
    </ProductContext.Provider>
  );

};
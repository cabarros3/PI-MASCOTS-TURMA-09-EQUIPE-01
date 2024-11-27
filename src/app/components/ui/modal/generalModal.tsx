"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/firebase.config"; // Importe a configuração do Firebase
import { doc, updateDoc } from "firebase/firestore"; // Funções do Firestore

type Field = {
  name: string;
  label: string;
  type: string;
  value: string;
};

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Record<string, string>) => void;
  fields: Field[];
  title: string;
  id: string;
  collectionName: string; // Nome da coleção no Firestore
};

export default function GeneralModal({
  isOpen,
  onClose,
  onSave,
  fields,
  title,
  id,
  collectionName,
}: EditModalProps) {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => {
      acc[field.name as string] = field.value;
      return acc;
    }, {} as Record<string, string>)
  );

  // Função para atualizar o estado ao mudar os campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para enviar os dados ao Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Referência ao documento no Firestore
      const docRef = doc(db, collectionName, id);

      // Atualiza os dados no Firestore
      await updateDoc(docRef, formData);

      // Atualiza o estado com os dados modificados e fecha o modal
      onSave(formData);
      onClose();
      window.alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar os dados no Firestore:", error);
      window.alert("Ocorreu um erro ao atualizar os dados.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

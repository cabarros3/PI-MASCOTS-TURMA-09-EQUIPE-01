"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Usando useParams em vez de useRouter
import { format } from "date-fns";
import { useMedicalAppointmentContext } from "@/app/contexts/medicalAppointment";

export default function GeneralForm() {
  const params = useParams(); // Acessando os parâmetros da URL
  const context = useMedicalAppointmentContext();

  if (!context) {
    throw new Error("MedicalAppointmentContext não está disponível!");
  }

  const {
    currentPatientId,
    currentTutorId,
    setCurrentPatientId,
    setCurrentTutorId,
    addMedicalAppointment,
    loadPatientAppointments,
  } = context;

  // Estado para armazenar os IDs
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedVet, setSelectedVet] = useState<string>("");
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [sendToAdmission, setSendToAdmission] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  // Captura dos parâmetros da URL via useParams
  const tutorIdFromUrl = params.tutorId as string;
  const petIdFromUrl = params.petId as string;

  useEffect(() => {
    // Verifique se os parâmetros da URL estão disponíveis
    if (tutorIdFromUrl && petIdFromUrl) {
      setCurrentTutorId(tutorIdFromUrl);
      setCurrentPatientId(petIdFromUrl);
      console.log("IDs atualizados:", tutorIdFromUrl, petIdFromUrl);
    } else {
      console.log("TutorId ou PetId não encontrados na URL.");
    }
  }, [tutorIdFromUrl, petIdFromUrl, setCurrentTutorId, setCurrentPatientId]);

  // Atualiza a data e hora a cada minuto
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = format(now, "dd/MM/yyyy");
      const formattedTime = format(now, "HH:mm");

      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateDateTime();

    const intervalId = setInterval(updateDateTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Efetuar o carregamento das consultas apenas se os IDs estiverem disponíveis
  useEffect(() => {
    if (currentPatientId && currentTutorId) {
      loadPatientAppointments(currentTutorId, currentPatientId);
    }
  }, [currentPatientId, currentTutorId, loadPatientAppointments]);

  const handleVetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVet(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);

    // Atualização do valor do campo de texto com base na seleção
    if (value === "Dermatologia Veterinária") {
      setTextareaValue(
        "Anamnese:\nexame físico:\ndiagnóstico:\noutras considerações:"
      );
    } else if (value === "Nutrição Veterinária") {
      setTextareaValue(
        "Histórico nutricional:\nAlimentos recomendados:\nObservações adicionais:"
      );
    } else if (value === "Clínica Geral") {
      setTextareaValue(
        "Queixa principal:\nExame físico:\nDiagnóstico:\nPlano terapêutico:"
      );
    } else if (value === "Neurologia Veterinária") {
      setTextareaValue(
        "Anamnese neurológica:\nExame neurológico:\nDiagnóstico neurológico:"
      );
    } else if (value === "Cirurgia Veterinária") {
      setTextareaValue(
        "Tipo de cirurgia:\nObjetivo da cirurgia:\nObservações pré-operatórias:"
      );
    } else {
      setTextareaValue("");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendToAdmission(e.target.checked);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verifique se os IDs estão definidos antes de enviar o formulário
    if (!currentTutorId || !currentPatientId) {
      console.error("TutorId ou PetId não encontrados!");
      return;
    }

    const currentTimestamp = new Date().toISOString();

    const event = {
      appointmentType: selectedOption,
      title: title,
      vet: selectedVet,
      notes: textareaValue,
      send_to_admission: sendToAdmission,
      timeStamp: currentTimestamp,
    };

    console.log("Dados para salvar no Firestore:", event);

    // Verifica se os IDs estão disponíveis no contexto antes de salvar
    try {
      await addMedicalAppointment(currentTutorId, currentPatientId, event);

      // Limpa os campos do formulário após enviar os dados
      setSelectedOption("");
      setTextareaValue("");
      setSelectedVet("");
      setSendToAdmission(false);
      setTitle("");
    } catch (error) {
      console.error("Erro ao adicionar atendimento:", error);
    }
  };

  return (
    <form className="px-5 py-10" onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-row gap-5 items-center">
          <span className="text-blue-400 text-lg roboto-regular">
            {currentDate}
          </span>
          <span className="text-gray-400 text-sm roboto-regular">
            {currentTime}
          </span>
        </div>
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-2">
            <label>Tipo de atendimento</label>
            <select
              name="Tipo de atendimento"
              id="tipo"
              className="px-2 py-2"
              value={selectedOption}
              onChange={handleSelectChange}
              required
            >
              <option value="" disabled>
                Selecione um tipo de atendimento
              </option>
              <option value="Dermatologia Veterinária">
                Consulta em Dermatologia
              </option>
              <option value="Nutrição Veterinária">Consulta em Nutrição</option>
              <option value="Clínica Geral">Clínico Geral</option>
              <option value="Neurologia Veterinária">
                Consulta em Neurologia
              </option>
              <option value="Cirurgia Veterinária">Cirugia Veterinária</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label>Resumo</label>
            <input
              type="text"
              name="resumo"
              value={title}
              onChange={handleTitleChange}
              className="w-full border px-1 py-1"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label>Veterinário responsável</label>
          <select
            name="veterinário"
            value={selectedVet}
            onChange={handleVetChange}
            className="w-2/4 px-2 py-2"
          >
            <option value="Veterinário 1">Veterinário 1</option>
            <option value="Veterinário 2">Veterinário 2</option>
            <option value="Veterinário 3">Veterinário 3</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label>Observações</label>
          <textarea
            value={textareaValue}
            onChange={handleTextareaChange}
            className="w-full px-3 py-3"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="admission"
            checked={sendToAdmission}
            onChange={handleCheckboxChange}
          />
          <label>Enviar para a internação?</label>
        </div>
        <div className="flex gap-5 justify-end mt-5">
          <button
            type="button"
            className="border-2 border-darkCyan text-darkCyan px-4 py-2 roboto-regular text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-darkCyan text-white roboto-regular text-sm"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}

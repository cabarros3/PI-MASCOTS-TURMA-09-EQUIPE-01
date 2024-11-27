"use client";

import {
  useContext,
  useState,
  ReactNode,
  createContext,
  useEffect,
  useCallback,
} from "react";
import { db } from "@/lib/firebase/firebase.config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation"; // Alteração para usar useSearchParams

// Tipos e interfaces
interface AppointmentData {
  appointmentType: string;
  title: string;
  vet: string;
  notes: string;
  send_to_admission: boolean;
  timeStamp: string;
  isLast?: boolean;
}

type MedicalAppointmentContextType = {
  appointmentHistory: AppointmentData[];
  addMedicalAppointment: (
    tutorId: string,
    petId: string,
    appointmentData: AppointmentData
  ) => Promise<void>;
  loadPatientAppointments: (tutorId: string, petId: string) => void;
  currentPatientId: string | null;
  currentTutorId: string | null;
  setCurrentPatientId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentTutorId: React.Dispatch<React.SetStateAction<string | null>>;
  tutorId: string | null; // Tutor ID (se necessário em outro ponto do contexto)
  petId: string | null;
};

const MedicalAppointmentContext = createContext<
  MedicalAppointmentContextType | undefined
>(undefined);

// cria o provider
export function MedicalAppointmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [appointmentHistory, setAppointmentHistory] = useState<
    AppointmentData[]
  >([]);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [currentTutorId, setCurrentTutorId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Usando useSearchParams para pegar os parâmetros de consulta na URL
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");
  const petId = searchParams.get("petId");

  // Função para carregar as consultas de um paciente específico do Firestore
  const loadPatientAppointments = useCallback(
    async (tutorId: string, petId: string) => {
      if (petId === currentPatientId) return; // Evita carregar se o ID do paciente já estiver correto

      console.log("Atualizando o currentPatientId para:", petId);
      setCurrentPatientId(petId);

      try {
        const appointmentsCollection = collection(
          db,
          `tutores/${tutorId}/petsVinculados/${petId}/pet-medical-appointment`
        );
        const querySnapshot = await getDocs(appointmentsCollection);

        const appointments: AppointmentData[] = querySnapshot.docs.map(
          (doc) => {
            const data = doc.data();
            return {
              appointmentType: data.appointmentType || "",
              title: data.title || "",
              vet: data.vet || "",
              notes: data.notes || "",
              send_to_admission: data.send_to_admission || false,
              timeStamp: data.timeStamp || "",
              isLast: data.isLast || false,
              id: doc.id,
            };
          }
        );

        setAppointmentHistory(appointments);
      } catch (error) {
        console.error("Erro ao carregar consultas do paciente:", error);
        setAppointmentHistory([]);
      }
    },
    [currentPatientId] // Passando dependência para currentPatientId
  );

  // useEffect para verificar se o código está sendo executado no lado do cliente
  useEffect(() => {
    setIsClient(true); // Definimos que estamos no lado do cliente
  }, []);

  // useEffect para garantir que a consulta seja carregada assim que os IDs forem definidos
  useEffect(() => {
    if (!isClient) return; // Não faz nada se não estamos no lado do cliente
    const tutorIdFromUrl = tutorId || currentTutorId; // Prioriza o tutorId da URL, mas usa o do contexto se disponível
    const petIdFromUrl = petId || currentPatientId; // Prioriza o petId da URL, mas usa o do contexto se disponível

    if (tutorIdFromUrl && petIdFromUrl) {
      if (!currentTutorId || !currentPatientId) {
        // Caso os IDs ainda não estejam configurados, define-os
        setCurrentTutorId(tutorIdFromUrl as string);
        setCurrentPatientId(petIdFromUrl as string);
      }
      // Carrega as consultas médicas assim que os IDs forem configurados
      loadPatientAppointments(tutorIdFromUrl as string, petIdFromUrl as string);
    }
  }, [
    tutorId,
    petId,
    currentTutorId,
    currentPatientId,
    loadPatientAppointments,
    isClient,
  ]);

  // Função para adicionar uma consulta médica
  const addMedicalAppointment = async (
    tutorId: string,
    petId: string,
    appointmentData: AppointmentData
  ) => {
    try {
      if (!tutorId || !petId) {
        console.error("Tutor ID ou Pet ID não fornecido");
        return;
      }

      const appointmentsCollection = collection(
        db,
        `tutores/${tutorId}/petsVinculados/${petId}/pet-medical-appointment`
      );

      // Adiciona a consulta
      const docRef = await addDoc(appointmentsCollection, appointmentData);

      // Verifica se a adição foi bem-sucedida
      alert("Consulta adicionada com sucesso!");
      console.log("Consulta adicionada com sucesso! ID:", docRef.id);

      // Se for o paciente atual, atualize o histórico de consultas
      if (petId === currentPatientId) {
        setAppointmentHistory((prev) => [
          ...prev,
          { ...appointmentData, id: docRef.id },
        ]);
      }
    } catch (error) {
      console.error("Erro ao adicionar consulta:", error);
    }
  };

  const value = {
    appointmentHistory,
    addMedicalAppointment,
    loadPatientAppointments,
    currentPatientId,
    currentTutorId,
    setCurrentPatientId,
    setCurrentTutorId,
    tutorId,
    petId,
  };

  return (
    <MedicalAppointmentContext.Provider value={value}>
      {children}
    </MedicalAppointmentContext.Provider>
  );
}

// chama o contexto
export function useMedicalAppointmentContext() {
  const context = useContext(MedicalAppointmentContext);
  if (context === undefined) {
    throw new Error(
      "useMedicalAppointmentContext must be used within a MedicalAppointmentProvider"
    );
  }
  return context;
}

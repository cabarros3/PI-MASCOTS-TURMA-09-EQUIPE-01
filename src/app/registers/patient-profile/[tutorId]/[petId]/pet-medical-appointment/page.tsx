"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase.config"; // Importe a configuração do Firestore
import { SideBar } from "@/app/components/navigationScreen/sidebar/sidebar";
import { Header } from "@/app/components/navigationScreen/header/header";
import { BreadCrumb } from "@/app/components/ui/breadcrumbs/breadcrumb";
import CircularProgress from "@mui/material/CircularProgress";
import { SectionTitle } from "@/app/components/ui/titles/sectionTitle";
import GeneralForm from "@/app/components/ui/forms/form";
import Tab from "@/app/components/ui/tabs/tab";
import { useMedicalAppointmentContext } from "@/app/contexts/medicalAppointment";
import TimeLine from "@/app/components/ui/tl/timeLine";
import { collection, getDocs } from "firebase/firestore";

type Patient = {
  id: string;
  icon: string;
  name: string;
  owners_cpf: string;
  owners_name: string;
  owners_fone: string;
  owners_email: string;
  schedule: string;
  description: string;
  recordNumber: string;
  admissionDate: string;
  exitDate: string;
  weight: string;
  breed: string;
  gender: string;
  fisicalDescription: string;
  specie: string;
  alergies: string;
  vet: string;
  vetSpeciality: string;
  appointmentStatus: string;
  age: string;
  boxLocation: string;
  category: string;
  color_classification: string;
  link_profilePic: string;
};

type Consultation = {
  id: string;
  date: string;
  title: string;
  timeStamp: string;
  description: string;
};

export default function PatientMedicalAppointment() {
  const params = useParams();
  const tutorId = Array.isArray(params["tutorId"])
    ? params["tutorId"][0]
    : params["tutorId"];
  const petId = Array.isArray(params["petId"])
    ? params["petId"][0]
    : params["petId"];

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const context = useMedicalAppointmentContext();

  const fetchConsultations = async (
    tutorId: string,
    petId: string
  ): Promise<Consultation[]> => {
    const consultationsRef = collection(
      db,
      "tutores",
      tutorId,
      "petsVinculados",
      petId,
      "consultas"
    );
    const querySnapshot = await getDocs(consultationsRef);
    const consultations: Consultation[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Consultation[];

    return consultations;
  };

  useEffect(() => {
    if (!tutorId || !petId) return;

    // Função para buscar dados do paciente no Firestore
    const fetchPatientData = async () => {
      try {
        const docRef = doc(db, "tutores", tutorId, "petsVinculados", petId); // Busca o pet vinculado ao tutor
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Patient;
          setPatient({ ...data, id: docSnap.id });

          // Buscar consultas vinculadas ao pet
          const consultationsRef = collection(
            db,
            "tutores",
            tutorId,
            "petsVinculados",
            petId,
            "pet-medical-appointment"
          );
          const querySnapshot = await getDocs(consultationsRef);

          // // Processar os dados das consultas
          // const fetchedConsultations = querySnapshot.docs.map((doc) => ({
          //   id: doc.id,
          //   ...doc.data(),
          // })) as Consultation[];

          // Processar os dados das consultas
          const fetchedConsultations = querySnapshot.docs.map((doc) => {
            const data = doc.data();

            // Transformação de dados para compatibilidade com TimeLineItemProps
            return {
              id: doc.id,
              date: new Date(data.timeStamp).toLocaleDateString("pt-BR"),
              timeStamp: new Date(data.timeStamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              title: data.title || "Consulta",
              description: `
Tipo: ${data.appointmentType || "N/A"}\n
Veterinário: ${data.vet || "N/A"}\n
Notas: ${data.notes || "Sem observações"}
`,
            };
          });

          setConsultations(fetchedConsultations); // Atualizar estado das consultas

          // Carregar as consultas do paciente
          context.loadPatientAppointments(tutorId, petId);
        } else {
          console.log("No such document!");
          setPatient(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do paciente:", error);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [tutorId, petId, context]); // Dependências corretas para recarregar os dados

  if (!context) {
    return <div>Erro: contexto de consultas não encontrado.</div>;
  }

  // Condição de carregamento
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto ml-20 mt-[72px] px-10 py-8">
            <BreadCrumb
              link={`/registers/patient-profile/${tutorId}/${petId}`}
              description="Voltar para o perfil do pet"
            />
            <div className="flex flex-row gap-5 justify-center items-center h-screen">
              <CircularProgress color="success" />
              <span>Carregando....</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Condição de paciente não encontrado
  if (!patient) {
    return <div>Paciente não encontrado.</div>;
  }

  return (
    <>
      <div className="flex h-screen">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto ml-20 mt-[72px] px-10 py-8">
            <BreadCrumb
              link={`/registers/patient-profile/${tutorId}/${petId}`}
              description="Voltar para o perfil do pet"
            />
            <SectionTitle
              iconClass="fa-solid fa-suitcase-medical"
              sectionTitle="Consulta"
              color="text-tuftsBlue"
            />
            <div className="w-full shadow-md border">
              <div>
                <h3 className="bg-darkCyan roboto-regular text-white text-lg px-2 py-1">
                  Formulário de Consulta
                </h3>
              </div>
              <div className="py-5 px-5">
                <Tab labels={["Consulta", "Prescrições"]}>
                  <div className="flex flex-row justify-between">
                    <div className="px-5 py-10 w-1/2">
                      <div className="px-2 py-3">
                        <span className="text-lg roboto-regular text-darkCyan">
                          {/* Histórico de consultas */}
                          <TimeLine
                            events={consultations.map((consultation) => ({
                              date: consultation.date, // Certifique-se de que o campo "date" exista no Firestore
                              title: consultation.title,
                              timeStamp: consultation.timeStamp,
                              description: consultation.description,
                            }))}
                          ></TimeLine>
                        </span>
                      </div>
                    </div>
                    <div className="w-2/3">
                      <GeneralForm />
                    </div>
                  </div>
                </Tab>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

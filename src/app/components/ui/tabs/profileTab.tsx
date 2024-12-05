"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase.config"; // Configuração do Firebase
import { doc, getDoc } from "firebase/firestore"; // Funções do Firestore
import EditPetModal from "@/app/components/ui/modal/editPetModal";
import { useCallback } from "react";
// import { useRouter } from "next/router"; // Para capturar parâmetros da URL

type YearsType = {
  year: string;
  date: string;
  hour: string;
  type: string;
  reason: string;
};

type PetData = {
  name: string;
  breed: string;
  weight: string;
};

type ProfileTabProps = {
  actionButton?: React.ReactNode;
};

export default function ProfileTab({ actionButton }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState("Histórico");
  const [selectedYear, setSelectedYear] = useState("");
  // const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // const { tutorId, petId } = router.query; // Pegue os parâmetros dinamicamente da URL
  const [petData, setPetData] = useState<PetData | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null); // Adiciona o estado tutorId
  const [petId, setPetId] = useState<string | null>(null);
  // const [petData, setPetData] = useState<{
  //   name: string;
  //   breed: string;
  //   weight: string;
  // }>({
  //   name: "",
  //   breed: "",
  //   weight: "",
  // });
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true); // Função para abrir o modal
  const handleCloseModal = () => setModalOpen(false); // Função para fechar o modal
  const handleSave = (updatedData: {
    name: string;
    breed: string;
    weight: string;
  }) => {
    setPetData(updatedData); // Atualiza os dados do pet quando salvar
  };

  const fetchPetData = useCallback(async () => {
    if (typeof tutorId === "string" && typeof petId === "string") {
      try {
        const petDocRef = doc(db, "tutores", tutorId, "petsVinculados", petId);
        const petDoc = await getDoc(petDocRef);

        if (petDoc.exists()) {
          setPetData(petDoc.data() as PetData); // Atualiza os dados do pet
        } else {
          console.error("Pet não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do pet:", error);
      }
    }
  }, [petId, tutorId]); // A função depende de petId e tutorId

  useEffect(() => {
    setIsClient(true); // Sinaliza que o componente foi montado no cliente
  }, []);

  // useEffect(() => {
  //   if (isClient && router.isReady) {
  //     const { tutorId, petId } = router.query;
  //     setTutorId(tutorId as string);
  //     setPetId(petId as string);
  //   }
  // }, [isClient, router.isReady, router.query]);

  useEffect(() => {
    if (tutorId && petId) {
      fetchPetData(); // Chama a função apenas se tutorId e petId estiverem definidos
    }
  }, [tutorId, petId, fetchPetData]);

  const years: YearsType[] = [
    {
      year: "2024",
      date: "24/09",
      hour: "11:00",
      type: "Atendimento",
      reason: "Consulta com veterinário",
    },
    {
      year: "2024",
      date: "11/05",
      hour: "11:00",
      type: "internamento",
      reason: "Alta do internamento - Paciente liberado",
    },
    {
      year: "2024",
      date: "10/05",
      hour: "11:00",
      type: "Exames",
      reason: "Hemograma Completo",
    },
    {
      year: "2024",
      date: "09/05",
      hour: "11:00",
      type: "Internamento",
      reason: "Admitido na internação",
    },
    {
      year: "2023",
      date: "04/11",
      hour: "10:00",
      type: "Atendimento",
      reason: "Consulta com veterinário",
    },
  ];

  const groupedYears = years.reduce(
    (acc: Record<string, YearsType[]>, item: YearsType) => {
      if (!acc[item.year]) {
        acc[item.year] = [];
      }
      acc[item.year].push(item);
      return acc;
    },
    {} as Record<string, YearsType[]>
  );

  const currentYear = new Date().getFullYear().toString();
  const uniqueYears = [
    ...Array.from(new Set([currentYear, ...Object.keys(groupedYears)])),
  ].sort((a, b) => parseInt(b) - parseInt(a));

  const getBorderColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    const typeMap: Record<string, string> = {
      atendimento: "border-tuftsBlue",
      internamento: "border-auburn",
      exames: "border-redCrayola",
      prescrições: "border-grape",
      peso: "border-gamboge",
    };
    return typeMap[normalizedType] || "border-gray-400";
  };

  return (
    <div className="border w-full p-4 bg-white border-b-2 shadow-md rounded">
      <div className="flex space-x-4 border-b w-full">
        <button
          className={`tab-btn py-2 px-4 ${
            activeTab === "Histórico"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("Histórico")}
        >
          Histórico
        </button>
        <button
          className={`tab-btn py-2 px-4 ${
            activeTab === "Procedimentos"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("Procedimentos")}
        >
          Procedimentos
        </button>
        <button
          className={`tab-btn py-2 px-4 ${
            activeTab === "Exames"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("Exames")}
        >
          Exames
        </button>
      </div>
      <div className="mt-4">
        <div className="py-3 flex flex-row justify-between content-center border-b">
          {activeTab === "Histórico" && (
            <div>
              <form>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-10 py-2"
                >
                  {uniqueYears.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          )}
          <div
            className={`flex flex-row gap-5 ${
              activeTab !== "Histórico"
                ? "w-full justify-end"
                : "justify-between"
            }`}
          >
            <button className="border border-myrtleGreen text-myrtleGreen px-5 py-1">
              Enviar Mensagem
            </button>
            <button
              onClick={handleOpenModal}
              className="bg-myrtleGreen text-white px-5 py-1"
            >
              Editar Perfil
            </button>
            {petData &&
              tutorId &&
              petId &&
              typeof tutorId === "string" &&
              typeof petId === "string" && (
                <EditPetModal
                  isOpen={modalOpen}
                  onClose={handleCloseModal}
                  onSave={handleSave}
                  petData={petData}
                  petId={petId}
                  tutorId={tutorId}
                />
              )}
          </div>
        </div>
        {activeTab === "Histórico" && (
          <div className="flex flex-row">
            <div className="border-r w-3/6 pr-10 flex flex-col">
              {Object.keys(groupedYears)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((year, index) => (
                  <div key={index}>
                    {(selectedYear === "" || selectedYear === year) && (
                      <div>
                        <div className="py-3 text-tuftsBlue">{year}</div>
                        <div className="flex flex-col gap-4">
                          {groupedYears[year].map((item, index) => (
                            <div
                              key={index}
                              className={`flex flex-col border-l-4 ${getBorderColor(
                                item.type
                              )}`}
                            >
                              <span className="pl-3 text-gray-400 text-sm">
                                {item.date} - {item.hour}
                              </span>
                              <span className="pl-3 roboto-regular">
                                {item.type}
                              </span>
                              <span className="pl-3 roboto-light text-sm">
                                {item.reason}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="py-10 px-5">
              <div className="flex flex-row flex-wrap gap-5 justify-center">
                <div className="flex flex-col flex-wrap gap-3 bg-tuftsBlue w-52 px-10 py-5 rounded-tl-xl rounded-br-xl justify-center items-center">
                  {/* {actionButton && (
                    <div>
                      <i className="fa-solid fa-suitcase-medical text-white text-3xl"></i>
                      <span className="text-white text-lg">Atendimento</span>
                    </div>
                  )} */}
                  {actionButton}
                </div>
                <div className="flex flex-col gap-3 bg-auburn px-10 py-5 w-52 rounded-tl-xl rounded-br-xl justify-center items-center">
                  <i className="fa-solid fa-file-medical text-white text-3xl"></i>
                  <span className="text-white text-lg">Internamento</span>
                </div>
                <div className="flex flex-col flex-wrap gap-3 bg-redCrayola w-52 px-10 py-5 rounded-tl-xl rounded-br-xl justify-center items-center">
                  <i className="fa-solid fa-flask text-white text-3xl"></i>
                  <span className="text-white text-lg">Exames</span>
                </div>
                <div className="flex flex-col flex-wrap gap-3 bg-grape w-52 px-10 py-5 rounded-tl-xl rounded-br-xl justify-center items-center">
                  <i className="fa-solid fa-pills text-white text-3xl"></i>
                  <span className="text-white text-lg">Prescrição</span>
                </div>
                <div className="flex flex-col flex-wrap gap-3 bg-gamboge w-52 px-10 py-5 rounded-tl-xl rounded-br-xl justify-center items-center">
                  <i className="fa-solid fa-weight text-white text-3xl"></i>
                  <span className="text-white text-lg">Peso</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

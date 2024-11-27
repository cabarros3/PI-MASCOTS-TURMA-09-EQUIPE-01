"use client";
import { Appointments } from "@/app/components/internalHomePage/appointments";
import { Schedule } from "@/app/components/internalHomePage/scheduleForTheDay";
import { Header } from "@/app/components/navigationScreen/header/header";
import { SideBar } from "@/app/components/navigationScreen/sidebar/sidebar";
import Patient from "../components/internalHomePage/patient";
import LogOutbutton from "../components/LogOutButton";

export default function Page() {
  //antes estava com async
  // const session = await getServerSession();

  // if (!session) {
  //   redirect("/dashboard");
  // }
  return (
    <div>
      <Header />
      <SideBar />
      {/* <div>Olá{session?.user?.name}</div> */}
      <main>
        <div className="pt-24 pl-32">
          <h1 className="pb-12 text-3xl roboto-light">Painel Inicial</h1>
        </div>
        <Schedule />
        <Appointments />
        <Patient />
      </main>
      <div>
        {" "}
        <LogOutbutton />
      </div>
    </div>
  );
}

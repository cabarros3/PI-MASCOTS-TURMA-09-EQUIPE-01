import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  pages: {
    signIn: "/", // Define a página de login
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null; // Retorna explicitamente null caso as credenciais não existam
        }

        // Verificação de credenciais (exemplo estático, substitua pela lógica real)
        if (
          credentials.email === "funcionario@gmail.com" &&
          credentials.password === "123"
        ) {
          return {
            id: "1",
            name: "funcionario",
            email: "funcionario@gmail.com",
          }; // Retorna um objeto User válido
        }

        return null; // Retorna null caso as credenciais não sejam válidas
      },
    }),
  ],
});

export { handler as GET, handler as POST };

// import NextAuth from "next-auth"
// import  CredentialsProvider  from "next-auth/providers/credentials"

// const handler = NextAuth({
//     pages:{
//         signIn: "/"
//     },
//     providers: [
//         CredentialsProvider ({

//           name: 'Credentials',
//           credentials: {
//             email: { label: "Email", type: "email", placeholder: "email" },
//             password: { label: "Password", type: "password" }
//           },
//           async authorize(credentials) {
//             if (!credentials){

//                 return null
//             }
//             if(
//                 credentials.email === "funcionario@gmail.com" &&
//                 credentials.password === "123"
//             ){

//                 return{
//                     id:"1",
//                     name: "funcionario",
//                     email: "funcionario@gmail.com",
//                 }

//             }
//           }
//         })
//       ]
// })

// export { handler as GET, handler as POST }

// app/api/auth/options.ts (CORRIGIDO)

import CredentialsProvider from "next-auth/providers/credentials" ;
import { PrismaAdapter } from "@auth/prisma-adapter" ;
import { PrismaClient } from "@prisma/client" ;
import bcrypt from "bcryptjs" ;
import { NextAuthOptions } from "next-auth" ; // Este import está correto para o tipo

const prisma = new PrismaClient ( ) ;

// EXPORTE O OBJETO authOptions AQUI
export const authOptions : NextAuthOptions = {
  adapter : PrismaAdapter ( prisma ) ,
  providers : [
    CredentialsProvider ( {
      name : "credentials" ,
      credentials : {
        username : { label : "Usuário" , type : "text" } ,
        password : { label : "Password" , type : "password" } ,
      } ,
      async authorize ( credentials ) {
        if ( ! credentials ?. username || ! credentials ?. password ) {
          return null ;
        }
        const user = await prisma . user . findUnique ( {
          where : {
            username : credentials . username ,
          } ,
        } ) ;
        if ( ! user || ! user . password ) {
          return null ;
        }
        const isCorrectPassword = await bcrypt . compare (
          credentials . password ,
          user . password
        ) ;
        if ( ! isCorrectPassword ) {
          return null ;
        }
        return user ;
      } ,
    } ) ,
  ] ,
  pages : {
    signIn : "/admin/login" ,
  } ,
  session : {
    strategy : "jwt" ,
  } ,
  secret : process . env . NEXTAUTH_SECRET ,
} ;

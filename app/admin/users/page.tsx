import { User } from "@/lib/all-types";
import { UsersTable } from "../_components/users-table";

const days = (n: number) => new Date();

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Amina Farouk",
    email: "amina.farouk@waylink.io",
    image: null,
    role: "admin",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(410),
    updatedAt: days(0),
  },
  {
    id: "u2",
    name: "Youssef Nabil",
    email: "y.nabil@transitco.com",
    image: null,
    role: "provider",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(210),
    updatedAt: days(1),
  },
  {
    id: "u3",
    name: "Lina Haddad",
    email: "lina.haddad@gmail.com",
    image: null,
    role: "user",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(120),
    updatedAt: days(3),
  },
  {
    id: "u4",
    name: "Omar Reda",
    email: "omar.reda@cityexpeditions.com",
    image: null,
    role: "provider",
    emailVerified: true,
    banned: true,
    banReason: "Repeated policy violations — unverified pickup points",
    banExpires: null,
    createdAt: days(300),
    updatedAt: days(14),
  },
  {
    id: "u5",
    name: "Sara El-Amin",
    email: "sara.elamin@outlook.com",
    image: null,
    role: "user",
    emailVerified: false,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(9),
    updatedAt: days(9),
  },
  {
    id: "u6",
    name: "Karim Aziz",
    email: "karim.aziz@nileroutes.com",
    image: null,
    role: "provider",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(500),
    updatedAt: days(0),
  },
  {
    id: "u7",
    name: "Dina Mostafa",
    email: "dina.m@waylink.io",
    image: null,
    role: "admin",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(600),
    updatedAt: days(0),
  },
  {
    id: "u8",
    name: "Tarek Hossam",
    email: "tarek.hossam@protonmail.com",
    image: null,
    role: "user",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(45),
    updatedAt: days(2),
  },
  {
    id: "u9",
    name: "Nour Ibrahim",
    email: "nour.ibrahim@desertsafaris.com",
    image: null,
    role: "provider",
    emailVerified: true,
    banned: true,
    banReason: "Fraudulent booking activity reported by multiple customers",
    banExpires: days(40),
    createdAt: days(250),
    updatedAt: days(40),
  },
  {
    id: "u10",
    name: "Mostafa Kamal",
    email: "m.kamal@gmail.com",
    image: null,
    role: "user",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(2),
    updatedAt: days(0),
  },
  {
    id: "u11",
    name: "Hana Zaki",
    email: "hana.zaki@redseacruises.com",
    image: null,
    role: "provider",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(160),
    updatedAt: days(6),
  },
  {
    id: "u12",
    name: "Ali Sherif",
    email: "ali.sherif@yahoo.com",
    image: null,
    role: "user",
    emailVerified: true,
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: days(88),
    updatedAt: days(21),
  },
];
async function getUsers() {
  return MOCK_USERS;
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6 px-4 md:px-6 py-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage accounts, roles, and access across Way Link.
        </p>
      </div>
      <UsersTable initialUsers={users} />
    </div>
  );
}

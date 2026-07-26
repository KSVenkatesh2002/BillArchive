export const dynamic = 'force-dynamic';

export default function UserLayout({ children, taskModal }) {
  return (
    <>
      {children}
      {taskModal}
    </>
  );
}

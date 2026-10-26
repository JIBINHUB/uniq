import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export const metadata={title:'Private workspace | UNIQ FLOORS',robots:{index:false,follow:false}};
export default async function Studio(){
 redirect('/admin');
}

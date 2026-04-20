export default function AdminGaleria() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[1.8rem] text-[#f0ede8]">Galeria</h1>
        <p className="font-body text-[0.82rem] text-[#888480]">Upload e organização de fotos</p>
      </div>
      <div className="p-8 rounded border border-[rgba(240,237,232,0.08)] bg-[#111] text-center">
        <p className="font-display text-[1.2rem] text-[#c8b99a] mb-2">Em breve</p>
        <p className="font-body text-[0.85rem] text-[#888480]">
          O upload de fotos será ativado após configurar o Cloudinary.<br/>
          Acesse <strong className="text-[#f0ede8]">cloudinary.com</strong>, crie uma conta gratuita e adicione as credenciais no painel do Netlify.
        </p>
      </div>
    </div>
  )
}

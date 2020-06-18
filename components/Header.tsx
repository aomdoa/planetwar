import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Header: React.FC = () => {
  const router = useRouter()
  const isActive: (pathname: string) => boolean =
    pathname => router.pathname === pathname

  return (
    <div>
      <h1>Planet War</h1>
    </div>
  );
}

export default Header
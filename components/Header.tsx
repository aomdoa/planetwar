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
      <nav>
        <div className="left">
          <Link href="/">
            <a className="bold" data-active={isActive("/")}>
              Blog
            </a>
          </Link>
          <Link href="/drafts">
            <a data-active={isActive("/drafts")}>Drafts</a>
          </Link>
        </div>
        <div className="right">
          <Link href="/signup">
            <a data-active={isActive("/signup")}>Signup</a>
          </Link>
          <Link href="/create">
            <a data-active={isActive("/create")}>+ Create draft</a>
          </Link>
        </div>
        <style jsx>{`
          nav {
            display: flex;
            padding: 2rem;
            align-items: center;
          }

          .bold {
            font-weight: bold;
          }

          a {
            text-decoration: none;
            color: #000;
            display: inline-block;
          }

          .left a[data-active="true"] {
            color: gray;
          }

          a + a {
            margin-left: 1rem;
          }

          .right {
            margin-left: auto;
          }

          .right a {
            border: 1px solid black;
            padding: 0.5rem 1rem;
            border-radius: 3px;
          }
        `}</style>
      </nav>
    </div>
  );
}

export default Header
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToGroups() {
  const router = useRouter()

  useEffect(() => {
    router.push("/groups")
  }, [router])

  return null
}

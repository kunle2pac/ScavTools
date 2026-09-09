"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// StarkNet addresses are 0x-prefixed hex felts: up to 64 hex digits (252 bits),
// and unlike Ethereum addresses they are not required to be exactly 40 digits
// or zero-padded to a fixed width.
const STARKNET_ADDRESS_RE = /^0x[a-fA-F0-9]{1,64}$/

function validateStarknetAddress(value: string): string | null {
  if (!value.startsWith("0x")) {
    return "Address must start with 0x"
  }
  const hexPart = value.slice(2)
  if (hexPart.length === 0) {
    return "Address must contain hex digits after 0x"
  }
  if (!/^[a-fA-F0-9]+$/.test(hexPart)) {
    return "Address must contain only hex characters (0-9, a-f)"
  }
  if (hexPart.length > 64) {
    return "Address is too long for a StarkNet felt (max 64 hex digits)"
  }
  return null
}

export function AddressShortener() {
  const [address, setAddress] = useState("")
  const [shortAddress, setShortAddress] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const isValid = address.length > 0 && validateStarknetAddress(address) === null

  const shortenAddress = () => {
    try {
      setError("")

      const validationError = validateStarknetAddress(address)
      if (validationError) {
        throw new Error(validationError)
      }

      // Create shortened version (first 6 and last 4 characters)
      const shortened = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      setShortAddress(shortened)
    } catch (err) {
      setError((err as Error).message)
      setShortAddress("")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Contract Address Shortener</CardTitle>
        <CardDescription>Create shortened versions of blockchain addresses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">StarkNet Address</Label>
          <Input
            id="address"
            placeholder="0x..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              setError("")
              setShortAddress("")
            }}
            className="font-mono"
          />
          {address.length > 0 && validateStarknetAddress(address) && (
            <p className="text-sm text-destructive">{validateStarknetAddress(address)}</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button onClick={shortenAddress} disabled={!isValid}>
          Shorten Address
        </Button>

        {shortAddress && (
          <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <p className="font-mono">{shortAddress}</p>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            Note: In a production environment, this tool would connect to a backend service to store and retrieve
            shortened addresses.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

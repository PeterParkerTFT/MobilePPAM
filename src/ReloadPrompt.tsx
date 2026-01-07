import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error)
        },
    })

    useEffect(() => {
        if (needRefresh) {
            toast.message('Nueva actualización disponible', {
                description: 'Hay una nueva versión de la app lista para usar.',
                action: {
                    label: 'Actualizar',
                    onClick: () => updateServiceWorker(true),
                },
                duration: Infinity, // No desaparecer hasta que el usuario decida
            })
        }
    }, [needRefresh, updateServiceWorker])

    // Este componente no renderiza nada visible por sí mismo, usa el Toast
    return null
}

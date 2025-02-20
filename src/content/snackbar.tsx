import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack'
import React from 'react'

interface IProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void
}

const InnerSnackbarUtilsConfigurator: React.FC<IProps> = (props: IProps) => {
  props.setUseSnackbarRef(useSnackbar())
  return null
}

let useSnackbarRef: WithSnackbarProps
const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps) => {
  useSnackbarRef = useSnackbarRefProp
}

export const SnackbarUtilsConfigurator = () => {
  return <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />
}

const data = {
  success(msg: string,persist: boolean) {
    this.toast(msg, 'success',persist)
  },
  warning(msg: string,persist: boolean) {
    this.toast(msg, 'warning',persist)
  },
  info(msg: string, persist: boolean) {
    this.toast(msg, 'info',persist)
  },
  error(msg: string,persist: boolean) {
    this.toast(msg, 'error',persist)
  },
  toast(msg: string, variant: VariantType = 'default',persist:boolean) {
    useSnackbarRef.enqueueSnackbar(msg, { variant , persist ,preventDuplicate:true})
  }
}

export default data;
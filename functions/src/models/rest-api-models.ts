export interface IAd {
  creatorId: string,
  category: string, 
  title: string,
  description: string,
  location: string,
  price: number,
  images: string[],
  isNew: boolean,
  createDate: Date,
  lasEditDate: Date,
  moderated: boolean
}

export interface IAdCreate {
  category: string, 
  title: string,
  description: string,
  price: number,
  images: string[],
  isNew: boolean,
}

export interface IGetAd {
  id: string,
  creatorId: string,
  category: string, 
  title: string,
  description: string,
  location: string,
  price: number,
  images: string[],
  isNew: boolean,
  createDate: Date,
  lasEditDate: Date,
  moderated: boolean
}

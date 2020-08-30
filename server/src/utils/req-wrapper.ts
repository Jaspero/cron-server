import {Request, Response} from 'express';

export function reqWrapper(
 fn: (
   req: Request,
   res: Response
 ) => Promise<any>
) {
  return (req: Request, res: Response) => {
    fn(req, res)
      .then(data =>
        res.json(data || {})
      )
      .catch(error =>
        res
          .status(error.status || 500)
          .send({error: error.toString()})
      )
  }
}

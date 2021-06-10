FROM nikolaik/python-nodejs:python3.9-nodejs14

WORKDIR dena

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn/
RUN yarn install

COPY . ./
RUN yarn build

EXPOSE 3000
CMD ["yarn", "run", "serve:nocryptochip"]

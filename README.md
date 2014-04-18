# Beer Pals

## Getting started

1. Fork and clone [beerhub repository](https://github.com/beerpals/beerhub)
- Commit your beer ```git commit -m 'Mikkeller Geek Brunch Weasel' --allow-empty```
- Push your changes ```git push origin master```
- Check out your stats https://beerpals.github.io/#!/username

## FAQ

##### Do I really need to clone the beerhub repository?

- No, you can create your own repository and name it `beerhub`, but your drinking activity will be also recorded in the github timeline.

##### How to commit beer you have drunk a few hours ago?

- Change commit date: ```git commit -m 'St. Bernardus Abt 12' --date 'Wed Apr 9 23:53 2014 +0200' --allow-empty```

##### How to change the commit message of beer you drank and already committed?

- If it is just the last one, you can use `ammend` parameter: ```git commit --amend -m 'St. Bernardus Tripel' --date 'Wed Apr 9 23:53 2014 +0200' --allow-empty```

- Otherwise you need repeat ```git reset --hard HEAD^``` to remove the last commit for all wrong commit messages and then add the new commits ```git commit -m 'St. Bernardus Abt 12' --date 'Wed Apr 9 23:53 2014 +0200' --allow-empty```

- If you already pushed to github don't forget to ```git push -f origin master```.

##### Do you show all commits in my timeline?

- No, we use only master branch. We also filter commits and hide those which message starts with the following:
  - feat:
  - chore:
  - style:
  - fix:
  - test:
  - Merge 
